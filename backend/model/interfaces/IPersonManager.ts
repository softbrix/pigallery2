import {PersonEntry} from '../sql/enitites/PersonEntry';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {PersonDTO} from '../../../common/entities/PersonDTO';

export interface IPersonManager {
  getAll(): Promise<PersonEntry[]>;

  getSamplePhoto(name: string): Promise<PhotoDTO>;

  get(name: string): Promise<PersonEntry>;

  saveAll(names: string[]): Promise<void>;

  keywordsToPerson(media: MediaDTO[]): Promise<void>;

  updateCounts(): Promise<void>;

  updatePerson(name: string, partialPerson: PersonDTO): Promise<PersonEntry>;
}
