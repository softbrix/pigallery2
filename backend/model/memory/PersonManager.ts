import {IPersonManager} from '../interfaces/IPersonManager';
import {MediaDTO} from '../../../common/entities/MediaDTO';

export class IndexingTaskManager implements IPersonManager {
  keywordsToPerson(media: MediaDTO[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  get(name: string): Promise<any> {
    throw new Error('not supported by memory DB');
  }

  saveAll(names: string[]): Promise<void> {
    throw new Error('not supported by memory DB');
  }
}
