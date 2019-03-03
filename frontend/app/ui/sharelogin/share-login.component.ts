import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../model/network/authentication.service';
import {ErrorCodes} from '../../../../common/entities/Error';
import {Config} from '../../../../common/config/public/Config';
import {NavigationService} from '../../model/navigation.service';

@Component({
  selector: 'app-share-login',
  templateUrl: './share-login.component.html',
  styleUrls: ['./share-login.component.css'],
})
export class ShareLoginComponent implements OnInit {
  password: string;
  loginError = false;
  title: string;

  constructor(private _authService: AuthenticationService, private _navigation: NavigationService) {
    this.title = Config.Client.applicationTitle;
  }

  ngOnInit() {
    if (this._authService.isAuthenticated()) {
      this._navigation.toGallery();
    }
  }

  async onLogin() {
    this.loginError = false;

    try {
      await this._authService.shareLogin(this.password);

    } catch (error) {
      if (error && error.code === ErrorCodes.CREDENTIAL_NOT_FOUND) {
        this.loginError = true;
      }
    }
  }
}

