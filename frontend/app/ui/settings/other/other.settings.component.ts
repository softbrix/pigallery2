import {Component, OnChanges} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {OtherSettingsService} from './other.settings.service';
import {OtherConfigDTO} from '../../../../../common/entities/settings/OtherConfigDTO';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {Utils} from '../../../../../common/Utils';
import {SortingMethods} from '../../../../../common/entities/SortingMethods';

@Component({
  selector: 'app-settings-other',
  templateUrl: './other.settings.component.html',
  styleUrls: ['./other.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [OtherSettingsService],
})
export class OtherSettingsComponent extends SettingsComponent<OtherConfigDTO> implements OnChanges {


  types: { key: number; value: string }[] = [];
  threads: number[] = Utils.createRange(1, 100);

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: OtherSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Other'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      Server: s.Server.threading,
      Client: s.Client.Other
    }));
    this.types = Utils.enumToArray(SortingMethods);
    this.hasAvailableSettings = !this.simplifiedMode;
  }

  ngOnChanges(): void {
    this.hasAvailableSettings = !this.simplifiedMode;
  }


  public async save(): Promise<boolean> {
    const val = await super.save();
    if (val === true) {

      this.notification.info(this.i18n('Restart the server to apply the new settings'), this.i18n('Info'));
    }
    return val;
  }
}



