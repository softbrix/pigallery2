import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {ThumbnailConfig} from '../../../../../common/config/private/IPrivateConfig';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {SettingsService} from '../settings.service';

@Injectable()
export class ThumbnailSettingsService extends AbstractSettingsService<{ server: ThumbnailConfig, client: ClientConfig.ThumbnailConfig }> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }


  public updateSettings(settings: { server: ThumbnailConfig, client: ClientConfig.ThumbnailConfig }): Promise<void> {
    return this._networkService.putJson('/settings/thumbnail', {settings: settings});
  }

}
