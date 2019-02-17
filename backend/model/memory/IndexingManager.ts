import {IIndexingManager} from '../interfaces/IIndexingManager';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';

export class IndexingManager implements IIndexingManager {

  indexDirectory(relativeDirectoryName: string): Promise<DirectoryDTO> {
    throw new Error('not supported by memory DB');
  }


}
