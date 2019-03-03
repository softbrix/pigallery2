import {Component} from '@angular/core';
import {VideoSettingsService} from './video.settings.service';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {I18n} from '@ngx-translate/i18n-polyfill';


@Component({
  selector: 'app-settings-video',
  templateUrl: './video.settings.component.html',
  styleUrls: ['./video.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [VideoSettingsService],
})
export class VideoSettingsComponent extends SettingsComponent<ClientConfig.VideoConfig> {

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: VideoSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Video'), _authService, _navigation, <any>_settingsService, notification, i18n, s => s.Client.Video);
  }


}



