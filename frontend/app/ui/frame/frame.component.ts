import {Component, ViewEncapsulation} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthenticationService} from '../../model/network/authentication.service';
import {UserDTO, UserRoles} from '../../../../common/entities/UserDTO';
import {Config} from '../../../../common/config/public/Config';
import {BehaviorSubject} from 'rxjs';
import {NotificationService} from '../../model/notification.service';
import {QueryService} from '../../model/query.service';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css'],
  providers: [RouterLink],
  encapsulation: ViewEncapsulation.Emulated
})
export class FrameComponent {

  user: BehaviorSubject<UserDTO>;
  authenticationRequired = false;
  public title: string;
  collapsed = true;
  facesEnabled = Config.Client.Faces.enabled;

  constructor(private _authService: AuthenticationService,
              public notificationService: NotificationService,
              public queryService: QueryService) {
    this.user = this._authService.user;
    this.authenticationRequired = Config.Client.authenticationRequired;
    this.title = Config.Client.applicationTitle;
  }

  toggleState() { // click handler
    this.collapsed = !this.collapsed;
  }

  isAdmin() {
    return this.user.value && this.user.value.role >= UserRoles.Admin;
  }


  logout() {
    this._authService.logout();
  }
}

