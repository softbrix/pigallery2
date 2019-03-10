import {IPersonManager} from '../interfaces/IPersonManager';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {PersonDTO} from '../../../common/entities/PersonDTO';

export class PersonManager implements IPersonManager {

  getAll(): Promise<any[]> {
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

  onGalleryIndexUpdate(): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  updatePerson(name: string, partialPerson: PersonDTO): Promise<any> {
    throw new Error('not supported by memory DB');
  }
}
