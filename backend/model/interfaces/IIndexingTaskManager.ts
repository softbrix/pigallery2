import {IndexingProgressDTO} from '../../../common/entities/settings/IndexingProgressDTO';

export interface IIndexingTaskManager {
  startIndexing(createThumbnails?: boolean): void;

  getProgress(): IndexingProgressDTO;

  cancelIndexing(): void;

  reset(): Promise<void>;
}
