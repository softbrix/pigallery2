import {Input, OnChanges, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {UserRoles} from '../../../../../common/entities/UserDTO';
import {Utils} from '../../../../../common/Utils';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {NotificationService} from '../../../model/notification.service';
import {NavigationService} from '../../../model/navigation.service';
import {AbstractSettingsService} from './abstract.settings.service';
import {IPrivateConfig} from '../../../../../common/config/private/IPrivateConfig';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {Subscription} from 'rxjs';


export abstract class SettingsComponent<T extends { [key: string]: any }, S extends AbstractSettingsService<T> = AbstractSettingsService<T>>
  implements OnInit, OnDestroy, OnChanges {

  @Input()
  public simplifiedMode = true;

  @ViewChild('settingsForm', {static: true})
  form: HTMLFormElement;

  @Output()
  hasAvailableSettings = true;

  public inProgress = false;
  public error: string = null;
  public changed = false;
  public settings: T = <any>{};
  public original: T = <any>{};
  text = {
    Enabled: 'Enabled',
    Disabled: 'Disabled',
    Low: 'Low',
    High: 'High'
  };
  private _subscription: Subscription = null;
  private readonly _settingsSubscription: Subscription = null;

  protected constructor(private name: string,
                        protected _authService: AuthenticationService,
                        private _navigation: NavigationService,
                        public _settingsService: S,
                        protected notification: NotificationService,
                        public i18n: I18n,
                        private sliceFN?: (s: IPrivateConfig) => T) {
    if (this.sliceFN) {
      this._settingsSubscription = this._settingsService.Settings.subscribe(this.onNewSettings);
      this.onNewSettings(this._settingsService._settingsService.settings.value);
    }
    this.text.Enabled = i18n('Enabled');
    this.text.Disabled = i18n('Disabled');
    this.text.Low = i18n('Low');
    this.text.High = i18n('High');
  }

  onNewSettings = (s: IPrivateConfig) => {
    this.settings = Utils.clone(this.sliceFN(s));
    this.original = Utils.clone(this.settings);
    this.ngOnChanges();
  };

  settingsSame(newSettings: T, original: T): boolean {
    if (typeof original !== 'object' || original == null) {
      return newSettings === original;
    }
    if (!newSettings) {
      return false;
    }
    if (Array.isArray(original) && original.length !== newSettings.length) {
      return false;
    }
    const keys = Object.keys(newSettings);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof original[key] === 'undefined') {
        throw new Error('unknown settings: ' + key);
      }
      if (typeof original[key] === 'object') {
        if (this.settingsSame(newSettings[key], original[key]) === false) {
          return false;
        }
      } else if (newSettings[key] !== original[key]) {
        return false;
      }
    }

    return true;
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
    this.getSettings();

    // TODO: fix after this issue is fixed: https://github.com/angular/angular/issues/24818
    this._subscription = this.form.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.changed = !this.settingsSame(this.settings, this.original);
      }, 0);
    });

  }

  ngOnChanges(): void {
    this.hasAvailableSettings = ((this._settingsService.isSupported() &&
      this._settingsService.showInSimplifiedMode())
      || !this.simplifiedMode);
  }


  ngOnDestroy() {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }
    if (this._settingsSubscription != null) {
      this._settingsSubscription.unsubscribe();
    }
  }

  public reset() {
    this.getSettings();
  }

  public async save() {
    this.inProgress = true;
    this.error = '';
    try {
      await this._settingsService.updateSettings(this.settings);
      await this.getSettings();
      this.notification.success(this.name + ' ' + this.i18n('settings saved'), this.i18n('Success'));
      this.inProgress = false;
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    }

    this.inProgress = false;
    return false;
  }

  private async getSettings() {
    await this._settingsService.getSettings();
    this.changed = false;
  }

}



