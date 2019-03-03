import {Component, Input} from '@angular/core';
import {Config} from '../../../../common/config/public/Config';
import {Cookie} from 'ng2-cookies';
import {CookieNames} from '../../../../common/CookieNames';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.css'],
})
export class LanguageComponent {

  @Input() isDark: boolean;
  languages: string[] = [];
  current: string = null;

  constructor() {
    this.languages = Config.Client.languages;
    if (Cookie.get(CookieNames.lang) != null) {
      this.current = Cookie.get(CookieNames.lang);
    }
  }

}

