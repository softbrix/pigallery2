import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {SettingsService} from '../settings.service';
import {BasicConfigDTO} from '../../../../../common/entities/settings/BasicConfigDTO';

@Injectable()
export class BasicSettingsService extends AbstractSettingsService<BasicConfigDTO> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }


  public updateSettings(settings: BasicConfigDTO): Promise<void> {
    return this._networkService.putJson('/settings/basic', {settings: settings});
  }

}
