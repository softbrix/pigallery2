import {Injectable} from '@angular/core';
import {UserDTO, UserRoles} from '../../../../common/entities/UserDTO';
import {BehaviorSubject} from 'rxjs';
import {UserService} from './user.service';
import {LoginCredential} from '../../../../common/entities/LoginCredential';
import {Cookie} from 'ng2-cookies';
import {Config} from '../../../../common/config/public/Config';
import {NetworkService} from './network.service';
import {ErrorCodes, ErrorDTO} from '../../../../common/entities/Error';
import {CookieNames} from '../../../../common/CookieNames';
import {ShareService} from '../../ui/gallery/share.service';

declare module ServerInject {
  export let user: UserDTO;
}

@Injectable()
export class AuthenticationService {

  public user: BehaviorSubject<UserDTO>;

  constructor(private _userService: UserService,
              private _networkService: NetworkService,
              private shareSerice: ShareService) {
    this.user = new BehaviorSubject(null);
    this.shareSerice.setUserObs(this.user);
    // picking up session..
    if (this.isAuthenticated() === false && Cookie.get(CookieNames.session) != null) {
      if (typeof ServerInject !== 'undefined' && typeof ServerInject.user !== 'undefined') {
        this.user.next(ServerInject.user);
      }
      this.getSessionUser();
    } else {
      if (Config.Client.authenticationRequired === false) {
        this.user.next(<UserDTO>{name: UserRoles[Config.Client.unAuthenticatedUserRole], role: Config.Client.unAuthenticatedUserRole});
      }
    }

    _networkService.addGlobalErrorHandler((error: ErrorDTO) => {
      if (error.code === ErrorCodes.NOT_AUTHENTICATED) {
        this.user.next(null);
        return true;
      }
      if (error.code === ErrorCodes.NOT_AUTHORISED) {
        this.logout();
        return true;
      }
      return false;
    });

  }

  public async login(credential: LoginCredential): Promise<UserDTO> {
    const user = await this._userService.login(credential);
    this.user.next(user);
    return user;
  }

  public async shareLogin(password: string): Promise<UserDTO> {
    const user = await this._userService.shareLogin(password);
    this.user.next(user);
    return user;
  }

  public isAuthenticated(): boolean {
    if (Config.Client.authenticationRequired === false) {
      return true;
    }
    return !!this.user.value;
  }

  public isAuthorized(role: UserRoles) {
    return this.user.value && this.user.value.role >= role;
  }

  public async logout() {
    await this._userService.logout();
    this.user.next(null);
  }

  private async getSessionUser(): Promise<void> {
    try {
      this.user.next(await this._userService.getSessionUser());
    } catch (error) {
      console.log(error);
    }

  }


}
