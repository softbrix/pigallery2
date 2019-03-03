import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';

@Injectable()
export class VideoSettingsService extends AbstractSettingsService<ClientConfig.MapConfig> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);

  }

  public updateSettings(settings: ClientConfig.VideoConfig): Promise<void> {
    return this._networkService.putJson('/settings/video', {settings: settings});
  }

}
