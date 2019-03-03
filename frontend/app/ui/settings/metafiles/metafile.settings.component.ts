import {Component} from '@angular/core';
import {MetaFileSettingsService} from './metafile.settings.service';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {I18n} from '@ngx-translate/i18n-polyfill';


@Component({
  selector: 'app-settings-meta-file',
  templateUrl: './metafile.settings.component.html',
  styleUrls: ['./metafile.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [MetaFileSettingsService],
})
export class MetaFileSettingsComponent extends SettingsComponent<ClientConfig.MetaFileConfig> {

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: MetaFileSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Meta file'), _authService, _navigation, <any>_settingsService, notification, i18n, s => s.Client.MetaFile);
  }


}



