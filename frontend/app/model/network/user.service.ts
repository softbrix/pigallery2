import {Injectable} from '@angular/core';
import {LoginCredential} from '../../../../common/entities/LoginCredential';
import {NetworkService} from './network.service';
import {UserDTO} from '../../../../common/entities/UserDTO';
import {Config} from '../../../../common/config/public/Config';
import {ShareService} from '../../gallery/share.service';

@Injectable()
export class UserService {


  constructor(private _networkService: NetworkService,
              private _shareService: ShareService) {
  }

  public logout(): Promise<string> {
    return this._networkService.postJson('/user/logout');
  }

  public login(credential: LoginCredential): Promise<UserDTO> {
    return this._networkService.postJson<UserDTO>('/user/login', {'loginCredential': credential});
  }

  public async shareLogin(password: string): Promise<UserDTO> {
    return this._networkService.postJson<UserDTO>('/share/login?sk=' + this._shareService.getSharingKey(), {'password': password});
  }

  public async getSessionUser(): Promise<UserDTO> {
    await this._shareService.wait();
    if (Config.Client.Sharing.enabled === true) {
      if (this._shareService.isSharing()) {
        return this._networkService.getJson<UserDTO>('/user/login', {sk: this._shareService.getSharingKey()});
      }
    }
    return this._networkService.getJson<UserDTO>('/user/login');
  }

}
