import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {PersonDTO} from '../../../../../common/entities/PersonDTO';
import {SearchTypes} from '../../../../../common/entities/AutoCompleteItem';
import {DomSanitizer} from '@angular/platform-browser';
import {PersonThumbnail, ThumbnailManagerService} from '../../gallery/thumbnailManager.service';
import {FacesService} from '../faces.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {Config} from '../../../../../common/config/public/Config';

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
              private _sanitizer: DomSanitizer,
              private faceService: FacesService,
              public  authenticationService: AuthenticationService) {

  }

  get CanUpdate(): boolean {
    return this.authenticationService.user.getValue().role >= Config.Client.Faces.writeAccessMinRole;
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

  async toggleFavourite($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    await this.faceService.setFavourite(this.person, !this.person.isFavourite).catch(console.error);
  }
}

