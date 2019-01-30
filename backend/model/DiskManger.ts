import {DirectoryDTO} from '../../common/entities/DirectoryDTO';
import {Logger} from '../Logger';
import {Config} from '../../common/config/private/Config';
import {DiskManagerTH} from './threading/ThreadPool';
import {DiskMangerWorker} from './threading/DiskMangerWorker';


const LOG_TAG = '[DiskManager]';

export class DiskManager {
  static threadPool: DiskManagerTH = null;

  public static init() {
    if (Config.Server.threading.enable === true) {
      DiskManager.threadPool = new DiskManagerTH(1);
    }
  }

  public static async scanDirectory(relativeDirectoryName: string): Promise<DirectoryDTO> {
    Logger.silly(LOG_TAG, 'scanning directory:', relativeDirectoryName);


    let directory: DirectoryDTO = null;

    if (Config.Server.threading.enable === true) {
      directory = await DiskManager.threadPool.execute(relativeDirectoryName);
    } else {
      directory = await DiskMangerWorker.scanDirectory(relativeDirectoryName);
    }
    const addDirs = (dir: DirectoryDTO) => {
      dir.media.forEach((ph) => {
        ph.directory = dir;
      });
      dir.directories.forEach((d) => {
        addDirs(d);
      });
    };
    directory.media.sort((a,b) => a.name.localeCompare(b.name))
    addDirs(directory);
    return directory;
  }

}
