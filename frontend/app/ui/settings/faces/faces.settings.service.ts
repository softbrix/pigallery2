import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {DatabaseType} from '../../../../../common/config/private/IPrivateConfig';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';

@Injectable()
export class FacesSettingsService extends AbstractSettingsService<ClientConfig.FacesConfig> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }

  public isSupported(): boolean {
    return this._settingsService.settings.value.Server.database.type !== DatabaseType.memory &&
      this._settingsService.settings.value.Client.Search.enabled === true;
  }

  public updateSettings(settings: ClientConfig.FacesConfig): Promise<void> {
    return this._networkService.putJson('/settings/faces', {settings: settings});
  }

}
