import {Column, Entity,  OneToMany, PrimaryGeneratedColumn,  Unique, Index} from 'typeorm';
import {FaceRegionEntry} from './FaceRegionEntry';


@Entity()
@Unique(['name'])
export class PersonEntry {
  @Index()
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Column()
  name: string;

  @OneToMany(type => FaceRegionEntry, faceRegion => faceRegion.person)
  public faces: FaceRegionEntry[];
}
