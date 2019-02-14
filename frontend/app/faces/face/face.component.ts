import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {PersonDTO} from '../../../../common/entities/PersonDTO';
import {SearchTypes} from '../../../../common/entities/AutoCompleteItem';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.css'],
  providers: [RouterLink],
})
export class FaceComponent {
  @Input() person: PersonDTO;

  SearchTypes = SearchTypes;

  constructor(private _sanitizer: DomSanitizer) {

  }

  getSanitizedThUrl() {
    return this._sanitizer.bypassSecurityTrustStyle('url(' +
      encodeURI('/api/person/' + this.person.name + '/thumbnail')
        .replace(/\(/g, '%28')
        .replace(/'/g, '%27')
        .replace(/\)/g, '%29') + ')');
  }

}

