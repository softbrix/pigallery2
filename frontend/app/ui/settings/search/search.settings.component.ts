import {Component} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {SearchSettingsService} from './search.settings.service';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-settings-search',
  templateUrl: './search.settings.component.html',
  styleUrls: ['./search.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [SearchSettingsService],
})
export class SearchSettingsComponent extends SettingsComponent<ClientConfig.SearchConfig> {

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: SearchSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Search'), _authService, _navigation, _settingsService, notification, i18n, s => s.Client.Search);
  }


}



