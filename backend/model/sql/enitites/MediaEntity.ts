import {Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, TableInheritance, Unique} from 'typeorm';
import {DirectoryEntity} from './DirectoryEntity';
import {MediaDimension, MediaDTO, MediaMetadata} from '../../../../common/entities/MediaDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {CameraMetadataEntity, PositionMetaDataEntity} from './PhotoEntity';
import {FaceRegionEntry} from './FaceRegionEntry';

export class MediaDimensionEntity implements MediaDimension {

  @Column('int')
  width: number;

  @Column('int')
  height: number;
}


export class MediaMetadataEntity implements MediaMetadata {
  @Column('text')
  caption: string;

  @Column(type => MediaDimensionEntity)
  size: MediaDimensionEntity;

  @Column('bigint', {
    unsigned: true, transformer: {
      from: v => parseInt(v, 10),
      to: v => v
    }
  })
  creationDate: number;

  @Column('int', {unsigned: true})
  fileSize: number;

  @Column('simple-array')
  keywords: string[];

  @Column(type => CameraMetadataEntity)
  cameraData: CameraMetadataEntity;

  @Column(type => PositionMetaDataEntity)
  positionData: PositionMetaDataEntity;

  @Column('tinyint', {unsigned: true, default: OrientationTypes.TOP_LEFT})
  orientation: OrientationTypes;

  @OneToMany(type => FaceRegionEntry, faceRegion => faceRegion.media)
  faces: FaceRegionEntry[];

  @Column('int', {unsigned: true})
  bitRate: number;

  @Column('int', {unsigned: true})
  duration: number;
}

// TODO: fix inheritance once its working in typeorm
@Entity()
@Unique(['name', 'directory'])
@TableInheritance({column: {type: 'varchar', name: 'type', length: 32}})
export abstract class MediaEntity implements MediaDTO {

  @Index()
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Column()
  name: string;

  @Index()
  @ManyToOne(type => DirectoryEntity, directory => directory.media, {onDelete: 'CASCADE'})
  directory: DirectoryEntity;

  @Column(type => MediaMetadataEntity)
  metadata: MediaMetadataEntity;

  readyThumbnails: number[] = [];

  readyIcon = false;

}
