import {PersonEntry} from '../sql/enitites/PersonEntry';
import {MediaDTO} from '../../../common/entities/MediaDTO';

export interface IPersonManager {
  get(name: string): Promise<PersonEntry>;

  saveAll(names: string[]): Promise<void>;

  keywordsToPerson(media: MediaDTO[]): Promise<void>;
}
