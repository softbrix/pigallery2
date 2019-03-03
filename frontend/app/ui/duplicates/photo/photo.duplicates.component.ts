import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';
import {Media} from '../../gallery/Media';
import {IconThumbnail, Thumbnail, ThumbnailManagerService} from '../../gallery/thumbnailManager.service';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {MediaIcon} from '../../gallery/MediaIcon';

@Component({
  selector: 'app-duplicates-photo',
  templateUrl: './photo.duplicates.component.html',
  styleUrls: ['./photo.duplicates.component.css']
})
export class DuplicatesPhotoComponent implements OnInit, OnDestroy {
  @Input() media: MediaDTO;

  thumbnail: IconThumbnail;


  constructor(private thumbnailService: ThumbnailManagerService) {
  }

  get Orientation() {
    if (!this.media) {
      return OrientationTypes.TOP_LEFT;
    }
    return (<PhotoDTO>this.media).metadata.orientation || OrientationTypes.TOP_LEFT;
  }

  ngOnInit() {
    this.thumbnail = this.thumbnailService.getIcon(new MediaIcon(this.media));

  }

  ngOnDestroy() {
    this.thumbnail.destroy();
  }

}

