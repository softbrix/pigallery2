import {Media} from '../Media';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {VideoDTO} from '../../../../../common/entities/VideoDTO';

export class GridMedia extends Media {


  constructor(media: MediaDTO, renderWidth: number, renderHeight: number, public rowId: number) {
    super(media, renderWidth, renderHeight);
  }

  public get Orientation(): OrientationTypes {
    return (<PhotoDTO>this.media).metadata.orientation || OrientationTypes.TOP_LEFT;
  }

  isPhoto(): boolean {
    return MediaDTO.isPhoto(this.media);
  }

  isVideo(): boolean {
    return MediaDTO.isVideo(this.media);
  }

  get Video(): VideoDTO {
    return <VideoDTO>this.media;
  }
  get Photo(): PhotoDTO {
    return <PhotoDTO>this.media;
  }


}
