import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {SettingsService} from '../settings.service';
import {OtherConfigDTO} from '../../../../../common/entities/settings/OtherConfigDTO';

@Injectable()
export class OtherSettingsService extends AbstractSettingsService<OtherConfigDTO> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }


  public updateSettings(settings: OtherConfigDTO): Promise<void> {
    return this._networkService.putJson('/settings/other', {settings: settings});
  }

}
