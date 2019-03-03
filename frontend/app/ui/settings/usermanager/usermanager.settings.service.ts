import {Injectable} from '@angular/core';
import {UserDTO} from '../../../../../common/entities/UserDTO';
import {NetworkService} from '../../../model/network/network.service';
import {IPrivateConfig} from '../../../../../common/config/private/IPrivateConfig';

@Injectable()
export class UserManagerSettingsService {


  constructor(private _networkService: NetworkService) {
  }

  public createUser(user: UserDTO): Promise<string> {
    return this._networkService.putJson('/user', {newUser: user});
  }

  public async getSettings(): Promise<boolean> {
    return (await <Promise<IPrivateConfig>>this._networkService.getJson('/settings')).Client.authenticationRequired;
  }

  public updateSettings(settings: boolean): Promise<void> {
    return this._networkService.putJson('/settings/authentication', {settings: settings});
  }

  public getUsers(): Promise<Array<UserDTO>> {
    return this._networkService.getJson('/user/list');
  }


  public deleteUser(user: UserDTO): Promise<void> {
    return this._networkService.deleteJson('/user/' + user.id);
  }

  public updateRole(user: UserDTO): Promise<void> {
    return this._networkService.postJson('/user/' + user.id + '/role', {newRole: user.role});
  }
}
