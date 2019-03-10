import {MediaDimensionEntity} from '../../../../../backend/model/sql/enitites/MediaEntity';
import {
  CameraMetadataEntity,
  GPSMetadataEntity,
  PhotoEntity,
  PhotoMetadataEntity,
  PositionMetaDataEntity
} from '../../../../../backend/model/sql/enitites/PhotoEntity';
import * as path from 'path';
import {OrientationTypes} from 'ts-exif-parser';
import {DirectoryEntity} from '../../../../../backend/model/sql/enitites/DirectoryEntity';
import {VideoEntity, VideoMetadataEntity} from '../../../../../backend/model/sql/enitites/VideoEntity';
import {MediaDimension} from '../../../../../common/entities/MediaDTO';
import {CameraMetadata, FaceRegion, GPSMetadata, PhotoDTO, PhotoMetadata, PositionMetaData} from '../../../../../common/entities/PhotoDTO';
import {DirectoryDTO} from '../../../../../common/entities/DirectoryDTO';
import {FileDTO} from '../../../../../common/entities/FileDTO';

export class TestHelper {

  public static getDirectoryEntry() {

    const dir = new DirectoryEntity();
    dir.name = 'wars dir';
    dir.path = '.';
    dir.mediaCount = 0;
    dir.lastModified = Date.now();
    dir.lastScanned = null;

    return dir;
  }

  public static getPhotoEntry(dir: DirectoryEntity) {
    const sd = new MediaDimensionEntity();
    sd.height = 200;
    sd.width = 200;
    const gps = new GPSMetadataEntity();
    gps.altitude = 1;
    gps.latitude = 1;
    gps.longitude = 1;
    const pd = new PositionMetaDataEntity();
    pd.city = 'New York';
    pd.country = 'Alderan';
    pd.state = 'Kamino';
    pd.GPSData = gps;
    const cd = new CameraMetadataEntity();
    cd.ISO = 100;
    cd.model = '60D';
    cd.make = 'Canon';
    cd.fStop = 1;
    cd.exposure = 1;
    cd.focalLength = 1;
    cd.lens = 'Lens';
    const m = new PhotoMetadataEntity();
    m.caption = null;
    m.keywords = ['apple'];
    m.cameraData = cd;
    m.positionData = pd;
    m.size = sd;
    m.creationDate = Date.now();
    m.fileSize = 123456789;
    m.orientation = OrientationTypes.TOP_LEFT;

    // TODO: remove when typeorm is fixed
    m.duration = null;
    m.bitRate = null;


    const d = new PhotoEntity();
    d.name = 'test media.jpg';
    d.directory = dir;
    d.metadata = m;
    dir.mediaCount++;
    return d;
  }

  public static getVideoEntry(dir: DirectoryEntity) {
    const sd = new MediaDimensionEntity();
    sd.height = 200;
    sd.width = 200;

    const m = new VideoMetadataEntity();
    m.caption = null;
    m.keywords = null;
    m.size = sd;
    m.creationDate = Date.now();
    m.fileSize = 123456789;

    m.duration = 10000;
    m.bitRate = 4000;


    const d = new VideoEntity();
    d.name = 'test video.jpg';
    d.directory = dir;
    d.metadata = m;
    return d;
  }

  public static getPhotoEntry1(dir: DirectoryEntity) {
    const p = TestHelper.getPhotoEntry(dir);

    p.metadata.caption = 'Han Solo\'s dice';
    p.metadata.keywords = ['Boba Fett', 'star wars', 'Anakin', 'death star'];
    p.metadata.positionData.city = 'Mos Eisley';
    p.metadata.positionData.country = 'Tatooine';
    p.name = 'sw1';

    p.metadata.faces = [<any>{
      box: {height: 10, width: 10, x: 10, y: 10},
      name: 'Boba Fett'
    }, <any>{
      box: {height: 10, width: 10, x: 101, y: 101},
      name: 'Luke Skywalker'
    }, <any>{
      box: {height: 10, width: 10, x: 101, y: 101},
      name: 'Han Solo'
    }, <any>{
      box: {height: 10, width: 10, x: 101, y: 101},
      name: 'Unkle Ben'
    }];
    return p;
  }

  public static getVideoEntry1(dir: DirectoryEntity) {
    const p = TestHelper.getVideoEntry(dir);
    p.name = 'swVideo';
    return p;
  }

  public static getPhotoEntry2(dir: DirectoryEntity) {
    const p = TestHelper.getPhotoEntry(dir);

    p.metadata.keywords = ['Padmé Amidala', 'star wars', 'Natalie Portman', 'death star'];
    p.metadata.positionData.city = 'Derem City';
    p.metadata.positionData.state = 'Research City';
    p.metadata.positionData.country = 'Kamino';
    p.name = 'sw2';
    p.metadata.faces = [<any>{
      box: {height: 10, width: 10, x: 10, y: 10},
      name: 'Padmé Amidala'
    }, <any>{
      box: {height: 10, width: 10, x: 101, y: 101},
      name: 'Anakin Skywalker'
    }, <any>{
      box: {height: 10, width: 10, x: 101, y: 101},
      name: 'Obivan Kenobi'
    }];
    return p;
  }


  public static getRandomizedDirectoryEntry(parent: DirectoryDTO = null, forceStr: string = null) {

    const dir: DirectoryDTO = {
      id: null,
      name: forceStr || Math.random().toString(36).substring(7),
      path: '.',
      mediaCount: 0,
      directories: [],
      metaFile: [],
      media: [],
      lastModified: Date.now(),
      lastScanned: null,
      parent: null
    };
    if (parent !== null) {
      dir.path = path.join(parent.path, parent.name);
      parent.directories.push(dir);
    }
    return dir;
  }


  public static getRandomizedGPXEntry(dir: DirectoryDTO, forceStr: string = null): FileDTO {
    const d: FileDTO = {
      id: null,
      name: forceStr + '_' + Math.random().toString(36).substring(7) + '.gpx',
      directory: dir
    };
    dir.metaFile.push(d);
    return d;
  }


  public static getRandomizedFace(media: PhotoDTO, forceStr: string = null) {
    const rndStr = () => {
      return forceStr + '_' + Math.random().toString(36).substring(7);
    };

    const rndInt = (max = 5000) => {
      return Math.floor(Math.random() * max);
    };

    const f: FaceRegion = {
      name: rndStr() + '.jpg',
      box: {
        left: rndInt(),
        top: rndInt(),
        width: rndInt(),
        height: rndInt()
      }
    };
    media.metadata.faces = (media.metadata.faces || []);
    media.metadata.faces.push(f);
    return f;
  }

  public static getRandomizedPhotoEntry(dir: DirectoryDTO, forceStr: string = null, faces: number = 2): PhotoDTO {


    const rndStr = () => {
      return forceStr + '_' + Math.random().toString(36).substring(7);
    };

    const rndInt = (max = 5000) => {
      return Math.floor(Math.random() * max);
    };

    const sd: MediaDimension = {
      height: rndInt(),
      width: rndInt(),
    };

    const gps: GPSMetadata = {
      altitude: rndInt(1000),
      latitude: rndInt(1000),
      longitude: rndInt(1000)
    };
    const pd: PositionMetaData = {
      city: rndStr(),
      country: rndStr(),
      state: rndStr(),
      GPSData: gps
    };
    const cd: CameraMetadata = {
      ISO: rndInt(500),
      model: rndStr(),
      make: rndStr(),
      fStop: rndInt(10),
      exposure: rndInt(10),
      focalLength: rndInt(10),
      lens: rndStr()
    };
    const m: PhotoMetadata = {
      keywords: [rndStr(), rndStr()],
      cameraData: cd,
      positionData: pd,
      size: sd,
      creationDate: Date.now(),
      fileSize: rndInt(10000),
      orientation: OrientationTypes.TOP_LEFT,
      caption: rndStr()
    };


    const d: PhotoDTO = {
      id: null,
      name: rndStr() + '.jpg',
      directory: dir,
      metadata: m,
      readyThumbnails: [],
      readyIcon: false
    };

    for (let i = 0; i < faces; i++) {
      this.getRandomizedFace(d, 'Person ' + i);
    }

    dir.media.push(d);
    return d;
  }


}
