import {IIndexingTaskManager} from '../interfaces/IIndexingTaskManager';
import {IndexingProgressDTO} from '../../../common/entities/settings/IndexingProgressDTO';

export class IndexingTaskManager implements IIndexingTaskManager {

  startIndexing(): void {
    throw new Error('not supported by memory DB');
  }

  getProgress(): IndexingProgressDTO {
    throw new Error('not supported by memory DB');
  }

  cancelIndexing(): void {
    throw new Error('not supported by memory DB');
  }

  reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
