import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CameraMetadata, PhotoDTO, PositionMetaData} from '../../../../../../common/entities/PhotoDTO';
import {Config} from '../../../../../../common/config/public/Config';
import {MediaDTO} from '../../../../../../common/entities/MediaDTO';
import {VideoDTO, VideoMetadata} from '../../../../../../common/entities/VideoDTO';
import {Utils} from '../../../../../../common/Utils';
import {QueryService} from '../../../../model/query.service';
import {MapService} from '../../map/map.service';

@Component({
  selector: 'app-info-panel',
  styleUrls: ['./info-panel.lightbox.gallery.component.css'],
  templateUrl: './info-panel.lightbox.gallery.component.html',
})
export class InfoPanelLightboxComponent {
  @Input() media: MediaDTO;
  @Output() closed = new EventEmitter();

  public mapEnabled = true;

  constructor(public queryService: QueryService,
              public mapService: MapService) {
    this.mapEnabled = Config.Client.Map.enabled;
  }

  isPhoto() {
    return this.media && MediaDTO.isPhoto(this.media);
  }

  calcMpx() {
    return (this.media.metadata.size.width * this.media.metadata.size.height / 1000000).toFixed(2);
  }

  get FullPath(): string {
    return Utils.concatUrls(this.media.directory.path, this.media.directory.name, this.media.name);
  }

  get DirectoryPath() {
    return Utils.concatUrls(this.media.directory.path, this.media.directory.name);
  }




  isThisYear() {
    return (new Date()).getFullYear() ===
      (new Date(this.media.metadata.creationDate)).getFullYear();
  }


  getTime() {
    const date = new Date(this.media.metadata.creationDate);
    return date.toTimeString().split(' ')[0];
  }


  toFraction(f: number) {
    if (f > 1) {
      return f;
    }
    return '1/' + (1 / f);
  }

  get VideoData(): VideoMetadata {
    if (typeof (<VideoDTO>this.media).metadata.bitRate === 'undefined') {
      return null;
    }
    return (<VideoDTO>this.media).metadata;
  }

  hasPositionData(): boolean {
    return !!(<PhotoDTO>this.media).metadata.positionData &&
      !!((<PhotoDTO>this.media).metadata.positionData.city ||
        (<PhotoDTO>this.media).metadata.positionData.state ||
        (<PhotoDTO>this.media).metadata.positionData.country);
  }

  hasGPS() {
    return (<PhotoDTO>this.media).metadata.positionData && (<PhotoDTO>this.media).metadata.positionData.GPSData &&
      (<PhotoDTO>this.media).metadata.positionData.GPSData.latitude && (<PhotoDTO>this.media).metadata.positionData.GPSData.longitude;
  }

  get PositionData(): PositionMetaData {
    return (<PhotoDTO>this.media).metadata.positionData;
  }

  getPositionText(): string {
    if (!(<PhotoDTO>this.media).metadata.positionData) {
      return '';
    }
    let str = (<PhotoDTO>this.media).metadata.positionData.city ||
      (<PhotoDTO>this.media).metadata.positionData.state || '';

    if (str.length !== 0) {
      str += ', ';
    }
    str += (<PhotoDTO>this.media).metadata.positionData.country || '';

    return str;
  }

  get CameraData(): CameraMetadata {
    return (<PhotoDTO>this.media).metadata.cameraData;
  }

  close() {
    this.closed.emit();
  }
}

