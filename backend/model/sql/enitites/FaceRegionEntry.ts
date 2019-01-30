import {FaceRegion, FaceRegionBox} from '../../../../common/entities/PhotoDTO';
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {PersonEntry} from './PersonEntry';
import {MediaEntity} from './MediaEntity';

export class FaceRegionBoxEntry implements FaceRegionBox {
  @Column('int')
  height: number;
  @Column('int')
  width: number;
  @Column('int')
  x: number;
  @Column('int')
  y: number;
}

/**
 * This is a switching table between media and persons
 */
@Entity()
export class FaceRegionEntry {

  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Column(type => FaceRegionBoxEntry)
  box: FaceRegionBoxEntry;

  // @PrimaryColumn('int')
  @ManyToOne(type => MediaEntity, media => media.metadata.faces, {onDelete: 'CASCADE', nullable: false})
  media: MediaEntity;

  // @PrimaryColumn('int')
  @ManyToOne(type => PersonEntry, person => person.faces, {onDelete: 'CASCADE', nullable: false})
  person: PersonEntry;

  name: string;

  public static fromRawToDTO(raw: {
    faces_id: number,
    faces_mediaId: number,
    faces_personId: number,
    faces_boxHeight: number,
    faces_boxWidth: number,
    faces_boxX: number,
    faces_boxY: number,
    person_id: number,
    person_name: string
  }): FaceRegion {
    return {
      box: {width: raw.faces_boxWidth, height: raw.faces_boxHeight, x: raw.faces_boxX, y: raw.faces_boxY},
      name: raw.person_name
    };
  }
}
