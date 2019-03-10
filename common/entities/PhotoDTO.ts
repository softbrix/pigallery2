import {DirectoryDTO} from './DirectoryDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {MediaDimension, MediaDTO, MediaMetadata} from './MediaDTO';

export interface PhotoDTO extends MediaDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
  metadata: PhotoMetadata;
  readyThumbnails: Array<number>;
  readyIcon: boolean;
}

export interface FaceRegionBox {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface FaceRegion {
  name: string;
  box?: FaceRegionBox; // some faces don t have region ass they are coming from keywords
}

export interface PhotoMetadata extends MediaMetadata {
  caption?: string;
  keywords?: string[];
  cameraData?: CameraMetadata;
  positionData?: PositionMetaData;
  orientation: OrientationTypes;
  size: MediaDimension;
  creationDate: number;
  fileSize: number;
  faces?: FaceRegion[];
}


export interface PositionMetaData {
  GPSData?: GPSMetadata;
  country?: string;
  state?: string;
  city?: string;
}

export interface GPSMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: number;
}


export interface CameraMetadata {
  ISO?: number;
  model?: string;
  make?: string;
  fStop?: number;
  exposure?: number;
  focalLength?: number;
  lens?: string;
}
