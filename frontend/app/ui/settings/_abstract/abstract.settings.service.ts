import {SettingsService} from '../settings.service';

export abstract class AbstractSettingsService<T> {

  protected constructor(public _settingsService: SettingsService) {

  }

  get Settings() {
    return this._settingsService.settings;
  }


  public getSettings(): Promise<void> {
    return this._settingsService.getSettings();
  }

  public showInSimplifiedMode(): boolean {
    return true;
  }

  isSupported() {
    return true;
  }

  abstract updateSettings(settings: T): Promise<void>;
}
