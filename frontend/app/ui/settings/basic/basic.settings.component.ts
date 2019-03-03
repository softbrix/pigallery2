import {Component} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {BasicSettingsService} from './basic.settings.service';
import {BasicConfigDTO} from '../../../../../common/entities/settings/BasicConfigDTO';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-settings-basic',
  templateUrl: './basic.settings.component.html',
  styleUrls: ['./basic.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [BasicSettingsService],
})
export class BasicSettingsComponent extends SettingsComponent<BasicConfigDTO> {

  urlPlaceholder = location.origin;
  urlBaseChanged = false;
  urlError = false;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: BasicSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Basic'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      port: s.Server.port,
      host: s.Server.host,
      imagesFolder: s.Server.imagesFolder,
      applicationTitle: s.Client.applicationTitle,
      publicUrl: s.Client.publicUrl,
      urlBase: s.Client.urlBase
    }));
    this.checkUrlError();
  }

  public async save(): Promise<boolean> {
    const val = await super.save();
    if (val === true) {
      this.notification.info(this.i18n('Restart the server to apply the new settings'));
    }
    return val;
  }

  calcBaseUrl(): string {
    const url = this.settings.publicUrl.replace(new RegExp('\\\\', 'g'), '/')
      .replace(new RegExp('http://', 'g'), '')
      .replace(new RegExp('https://', 'g'), '');
    if (url.indexOf('/') !== -1) {
      return url.substring(url.indexOf('/'));
    }
    return '';

  }

  checkUrlError() {
    this.urlError = this.settings.urlBase !== this.calcBaseUrl();
  }

  onUrlChanged() {
    if (this.urlBaseChanged === false) {
      this.settings.urlBase = this.calcBaseUrl();
    } else {
      this.checkUrlError();
    }

  }

  onUrlBaseChanged() {
    this.urlBaseChanged = true;

    this.checkUrlError();
  }

}



