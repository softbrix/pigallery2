import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../model/network/authentication.service';
import {UserDTO, UserRoles} from '../../../../common/entities/UserDTO';
import {Utils} from '../../../../common/Utils';
import {UserManagerSettingsService} from './usermanager.settings.service';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {NavigationService} from '../../model/navigation.service';
import {NotificationService} from '../../model/notification.service';
import {ErrorCodes, ErrorDTO} from '../../../../common/entities/Error';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-settings-usermanager',
  templateUrl: './usermanager.settings.component.html',
  styleUrls: ['./usermanager.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [UserManagerSettingsService],
})
export class UserMangerSettingsComponent implements OnInit {
  @ViewChild('userModal') public childModal: ModalDirective;
  public newUser = <UserDTO>{};
  public userRoles: Array<any> = [];
  public users: Array<UserDTO> = [];
  public enabled = true;
  public error: string = null;
  public inProgress = false;


  text = {
    Enabled: 'Enabled',
    Disabled: 'Disabled',
    Low: 'Low',
    High: 'High'
  };


  constructor(private _authService: AuthenticationService,
              private _navigation: NavigationService,
              private _userSettings: UserManagerSettingsService,
              private notification: NotificationService,
              public i18n: I18n) {
    this.text.Enabled = i18n('Enabled');
    this.text.Disabled = i18n('Disabled');
    this.text.Low = i18n('Low');
    this.text.High = i18n('High');
  }


  ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
    this.userRoles = Utils
      .enumToArray(UserRoles)
      .filter(r => r.key !== UserRoles.LimitedGuest)
      .filter(r => r.key <= this._authService.user.value.role)
      .sort((a, b) => a.key - b.key);

    this.getSettings();
    this.getUsersList();
  }

  canModifyUser(user: UserDTO): boolean {
    const currentUser = this._authService.user.value;
    if (!currentUser) {
      return false;
    }

    return currentUser.name !== user.name && currentUser.role >= user.role;
  }

  async switched(event: { previousValue: false, currentValue: true }) {
    this.inProgress = true;
    this.error = '';
    this.enabled = event.currentValue;
    try {
      await this._userSettings.updateSettings(this.enabled);
      await this.getSettings();
      if (this.enabled === true) {
        this.notification.success(this.i18n('Password protection enabled'), this.i18n('Success'));
        this.notification.info(this.i18n('Server restart is recommended.'));
        this.getUsersList();
      } else {
        this.notification.success(this.i18n('Password protection disabled'), this.i18n('Success'));
      }
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    }
    this.inProgress = false;
  }

  initNewUser() {
    this.newUser = <UserDTO>{role: UserRoles.User};
    this.childModal.show();
  }

  async addNewUser() {
    try {
      await this._userSettings.createUser(this.newUser);
      await this.getUsersList();
      this.childModal.hide();
    } catch (e) {
      const err: ErrorDTO = e;
      this.notification.error(err.message + ', ' + err.details, 'User creation error!');
    }
  }

  async updateRole(user: UserDTO) {
    await this._userSettings.updateRole(user);
    await this.getUsersList();
    this.childModal.hide();
  }

  async deleteUser(user: UserDTO) {
    await this._userSettings.deleteUser(user);
    await this.getUsersList();
    this.childModal.hide();
  }

  private async getSettings() {
    this.enabled = await this._userSettings.getSettings();
  }

  private async getUsersList() {
    try {
      this.users = await this._userSettings.getUsers();
    } catch (err) {
      this.users = [];
      if ((<ErrorDTO>err).code !== ErrorCodes.USER_MANAGEMENT_DISABLED) {
        throw err;
      }
    }
  }
}



