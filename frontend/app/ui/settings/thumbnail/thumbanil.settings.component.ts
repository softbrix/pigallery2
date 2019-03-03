import {Component, OnInit} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ThumbnailConfig, ThumbnailProcessingLib} from '../../../../../common/config/private/IPrivateConfig';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {ThumbnailSettingsService} from './thumbanil.settings.service';
import {Utils} from '../../../../../common/Utils';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-settings-thumbnail',
  templateUrl: './thumbanil.settings.component.html',
  styleUrls: ['./thumbanil.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [ThumbnailSettingsService],
})
export class ThumbnailSettingsComponent
  extends SettingsComponent<{ server: ThumbnailConfig, client: ClientConfig.ThumbnailConfig }>
  implements OnInit {
  types: Array<any> = [];
  ThumbnailProcessingLib: any;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: ThumbnailSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Thumbnail'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      client: s.Client.Thumbnail,
      server: s.Server.thumbnail
    }));
  }

  get ThumbnailSizes(): string {
    return this.settings.client.thumbnailSizes.join('; ');
  }

  set ThumbnailSizes(value: string) {
    value = value.replace(new RegExp(',', 'g'), ';');
    value = value.replace(new RegExp(' ', 'g'), ';');
    this.settings.client.thumbnailSizes = value.split(';')
      .map(s => parseInt(s, 10))
      .filter(i => !isNaN(i) && i > 0);
  }

  ngOnInit() {
    super.ngOnInit();
    this.types = Utils
      .enumToArray(ThumbnailProcessingLib).map((v) => {
        if (v.value.toLowerCase() === 'sharp') {
          v.value += ' ' + this.i18n('(recommended)');
        }
        if (v.value.toLowerCase() === 'gm') {
          v.value += ' ' + this.i18n('(deprecated)');
        }
        return v;
      });
    this.ThumbnailProcessingLib = ThumbnailProcessingLib;
  }

}



