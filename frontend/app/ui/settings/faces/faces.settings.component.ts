import {Component} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {FacesSettingsService} from './faces.settings.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {Utils} from '../../../../../common/Utils';
import {UserRoles} from '../../../../../common/entities/UserDTO';

@Component({
  selector: 'app-settings-faces',
  templateUrl: './faces.settings.component.html',
  styleUrls: ['./faces.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [FacesSettingsService],
})
export class FacesSettingsComponent extends SettingsComponent<ClientConfig.FacesConfig> {

  public userRoles: Array<any> = [];
  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: FacesSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Faces'), _authService, _navigation, _settingsService, notification, i18n, s => s.Client.Faces);

    this.userRoles = Utils
      .enumToArray(UserRoles)
      .filter(r => r.key !== UserRoles.LimitedGuest)
      .filter(r => r.key <= this._authService.user.value.role)
      .sort((a, b) => a.key - b.key);
  }


}



