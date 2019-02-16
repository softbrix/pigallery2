import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {FaceRegionEntry} from './FaceRegionEntry';
import {PersonDTO} from '../../../../common/entities/PersonDTO';


@Entity()
@Unique(['name'])
export class PersonEntry implements PersonDTO {
  @Index()
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Column()
  name: string;

  @Column('int', {unsigned: true, default: 0})
  count: number;

  @OneToMany(type => FaceRegionEntry, faceRegion => faceRegion.person)
  public faces: FaceRegionEntry[];
}
