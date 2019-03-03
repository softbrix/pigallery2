import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {DataBaseConfig} from '../../../../../common/config/private/IPrivateConfig';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {SettingsService} from '../settings.service';

@Injectable()
export class DatabaseSettingsService extends AbstractSettingsService<DataBaseConfig> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }


  public updateSettings(settings: DataBaseConfig): Promise<void> {
    return this._networkService.putJson('/settings/database', {settings: settings});
  }

}
