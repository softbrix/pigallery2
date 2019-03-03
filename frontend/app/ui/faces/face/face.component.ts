import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {PersonDTO} from '../../../../../common/entities/PersonDTO';
import {SearchTypes} from '../../../../../common/entities/AutoCompleteItem';
import {DomSanitizer} from '@angular/platform-browser';
import {PersonThumbnail, ThumbnailManagerService} from '../../gallery/thumbnailManager.service';

@Component({
  selector: 'app-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.css'],
  providers: [RouterLink],
})
export class FaceComponent implements OnInit, OnDestroy {
  @Input() person: PersonDTO;
  @Input() size: number;

  thumbnail: PersonThumbnail = null;
  SearchTypes = SearchTypes;

  constructor(private thumbnailService: ThumbnailManagerService,
              private _sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.thumbnail = this.thumbnailService.getPersonThumbnail(this.person);

  }

  getSanitizedThUrl() {
    return this._sanitizer.bypassSecurityTrustStyle('url(' +
      encodeURI(this.thumbnail.Src)
        .replace(/\(/g, '%28')
        .replace(/'/g, '%27')
        .replace(/\)/g, '%29') + ')');
  }

  ngOnDestroy() {
    if (this.thumbnail != null) {
      this.thumbnail.destroy();
    }
  }

}

