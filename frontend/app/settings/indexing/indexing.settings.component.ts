import {Component, OnDestroy, OnInit} from '@angular/core';
import {IndexingSettingsService} from './indexing.settings.service';
import {AuthenticationService} from '../../model/network/authentication.service';
import {NavigationService} from '../../model/navigation.service';
import {NotificationService} from '../../model/notification.service';
import {ErrorDTO} from '../../../../common/entities/Error';
import {interval, Observable} from 'rxjs';
import {IndexingConfig, ReIndexingSensitivity} from '../../../../common/config/private/IPrivateConfig';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {Utils} from '../../../../common/Utils';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {StatisticDTO} from '../../../../common/entities/settings/StatisticDTO';

@Component({
  selector: 'app-settings-indexing',
  templateUrl: './indexing.settings.component.html',
  styleUrls: ['./indexing.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [IndexingSettingsService],
})
export class IndexingSettingsComponent extends SettingsComponent<IndexingConfig, IndexingSettingsService>
  implements OnInit, OnDestroy {


  types: { key: number; value: string }[] = [];
  statistic: StatisticDTO;
  private subscription: { timer: any, settings: any } = {
    timer: null,
    settings: null
  };
  private $counter: Observable<number> = null;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: IndexingSettingsService,
              notification: NotificationService,
              i18n: I18n) {

    super(i18n('Indexing'),
      _authService,
      _navigation,
      <any>_settingsService,
      notification,
      i18n,
      s => s.Server.indexing);

  }

  get TimeLeft() {
    const prg = this._settingsService.progress.value;
    return (prg.time.current - prg.time.start) / prg.indexed * prg.left;
  }

  get TimeElapsed() {
    const prg = this._settingsService.progress.value;
    return (prg.time.current - prg.time.start);
  }

  updateProgress = async () => {
    try {
      const wasRunning = this._settingsService.progress.value !== null;
      await (<IndexingSettingsService>this._settingsService).getProgress();
      if (wasRunning && this._settingsService.progress.value === null) {
        this.notification.success(this.i18n('Folder indexed'), this.i18n('Success'));
      }
    } catch (err) {
      if (this.subscription.timer != null) {
        this.subscription.timer.unsubscribe();
        this.subscription.timer = null;
      }
    }
    if ((<IndexingSettingsService>this._settingsService).progress.value != null && this.subscription.timer == null) {
      if (!this.$counter) {
        this.$counter = interval(5000);
      }
      this.subscription.timer = this.$counter.subscribe((x) => this.updateProgress());
    }
    if ((<IndexingSettingsService>this._settingsService).progress.value == null && this.subscription.timer != null) {
      this.subscription.timer.unsubscribe();
      this.subscription.timer = null;
    }
  };

  async ngOnInit() {
    super.ngOnInit();
    this.types = Utils
      .enumToArray(ReIndexingSensitivity);
    this.types.forEach(v => {
      switch (v.value) {
        case 'low':
          v.value = this.i18n('low');
          break;
        case 'medium':
          v.value = this.i18n('medium');
          break;
        case 'high':
          v.value = this.i18n('high');
          break;
      }
    });
    this.updateProgress();
    this.statistic = await this._settingsService.getStatistic();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.subscription.timer != null) {
      this.subscription.timer.unsubscribe();
      this.subscription.timer = null;
    }
    if (this.subscription.settings != null) {
      this.subscription.settings.unsubscribe();
      this.subscription.settings = null;
    }
  }

  async index(createThumbnails: boolean) {
    this.inProgress = true;
    this.error = '';
    try {
      await this._settingsService.index(createThumbnails);
      this.updateProgress();
      this.notification.info(this.i18n('Folder indexing started'));
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

  async cancelIndexing() {
    this.inProgress = true;
    this.error = '';
    try {
      await (<IndexingSettingsService>this._settingsService).cancel();
      this._settingsService.progress.next(null);
      this.notification.info(this.i18n('Folder indexing interrupted'));
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

  async resetDatabase() {
    this.inProgress = true;
    this.error = '';
    try {
      await (<IndexingSettingsService>this._settingsService).reset();
      this.notification.success(this.i18n('Database reset'), this.i18n('Success'));
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


}



