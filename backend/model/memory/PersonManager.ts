import {IPersonManager} from '../interfaces/IPersonManager';

export class IndexingTaskManager implements IPersonManager {
  get(name: string): Promise<any> {
    throw new Error('not supported by memory DB');
  }

  saveAll(names: string[]): Promise<void> {
    throw new Error('not supported by memory DB');
  }
}
