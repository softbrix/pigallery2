import * as crypto from 'crypto';
import {IVersionManager} from '../interfaces/IVersionManager';
import {DataStructureVersion} from '../../../common/DataStructureVersion';
import {SQLConnection} from './SQLConnection';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {MediaEntity} from './enitites/MediaEntity';

const LOG_TAG = '[VersionManager]';

export class VersionManager implements IVersionManager {

  private allMediaCount = 0;
  private latestDirectoryStatus: {
    name: string,
    lastModified: number,
    mediaCount: number
  } = null;

  async getDataVersion(): Promise<string> {
    if (this.latestDirectoryStatus === null) {
      await this.updateDataVersion();
    }

    if (!this.latestDirectoryStatus) {
      return DataStructureVersion.toString();
    }

    const versionString = DataStructureVersion + '_' +
      this.latestDirectoryStatus.name + '_' +
      this.latestDirectoryStatus.lastModified + '_' +
      this.latestDirectoryStatus.mediaCount + '_' +
      this.allMediaCount;
    return crypto.createHash('md5').update(versionString).digest('hex');
  }

  async updateDataVersion() {
    const connection = await SQLConnection.getConnection();
    const dir = await connection.getRepository(DirectoryEntity)
      .createQueryBuilder('directory')
      .limit(1)
      .orderBy('directory.lastModified').getOne();
    this.allMediaCount = await connection.getRepository(MediaEntity)
      .createQueryBuilder('media').getCount();

    if (!dir) {
      return;
    }
    this.latestDirectoryStatus = {
      mediaCount: dir.mediaCount,
      lastModified: dir.lastModified,
      name: dir.name
    };
  }


}
