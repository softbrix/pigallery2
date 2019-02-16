import {IPersonManager} from '../interfaces/IPersonManager';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {PersonEntry} from '../sql/enitites/PersonEntry';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';

export class PersonManager implements IPersonManager {
  getAll(): Promise<PersonEntry[]> {
    throw new Error('Method not implemented.');
  }

  getSamplePhoto(name: string): Promise<PhotoDTO> {
    throw new Error('Method not implemented.');
  }

  keywordsToPerson(media: MediaDTO[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  get(name: string): Promise<any> {
    throw new Error('not supported by memory DB');
  }

  saveAll(names: string[]): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  updateCounts(): Promise<void> {
    throw new Error('not supported by memory DB');
  }
}
