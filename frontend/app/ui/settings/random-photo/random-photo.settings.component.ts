import {Component} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {RandomPhotoSettingsService} from './random-photo.settings.service';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-settings-random-photo',
  templateUrl: './random-photo.settings.component.html',
  styleUrls: ['./random-photo.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [RandomPhotoSettingsService],
})
export class RandomPhotoSettingsComponent extends SettingsComponent<ClientConfig.RandomPhotoConfig> {

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: RandomPhotoSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Random Media'), _authService, _navigation, _settingsService, notification, i18n, s => s.Client.RandomPhoto);
  }


}



