import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../model/network/authentication.service';
import {UserRoles} from '../../../../common/entities/UserDTO';
import {NotificationService} from '../../model/notification.service';
import {NotificationType} from '../../../../common/entities/NotificationDTO';
import {NavigationService} from '../../model/navigation.service';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  simplifiedMode = true;
  text = {
    Advanced: 'Advanced',
    Simplified: 'Simplified'
  };

  constructor(private _authService: AuthenticationService,
              private _navigation: NavigationService,
              public notificationService: NotificationService,
              public i18n: I18n) {
    this.text.Advanced = i18n('Advanced');
    this.text.Simplified = i18n('Simplified');
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated()
      || this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
  }

  public getCss(type: NotificationType) {
    switch (type) {
      case NotificationType.error:
        return 'danger';
      case NotificationType.warning:
        return 'warning';
      case NotificationType.info:
        return 'info';
    }
    return 'info';
  }

}



