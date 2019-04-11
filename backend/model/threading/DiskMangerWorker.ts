import * as fs from 'fs';
import {Stats} from 'fs';
import * as path from 'path';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {VideoDTO} from '../../../common/entities/VideoDTO';
import {FileDTO} from '../../../common/entities/FileDTO';
import {MetadataLoader} from './MetadataLoader';
import {Logger} from '../../Logger';

const LOG_TAG = '[DiskManagerTask]';

export class DiskMangerWorker {

  private static readonly SupportedEXT = {
    photo: [
      '.gif',
      '.jpeg', '.jpg', '.jpe',
      '.png',
      '.webp',
      '.svg'
    ],
    video: [
      '.mp4',
      '.webm',
      '.ogv',
      '.ogg'
    ],
    metaFile: [
      '.gpx'
    ]
  };

  public static calcLastModified(stat: Stats) {
    return Math.max(stat.ctime.getTime(), stat.mtime.getTime());
  }

  public static normalizeDirPath(dirPath: string) {
    return path.normalize(path.join('.' + path.sep, dirPath));
  }

  public static scanDirectory(relativeDirectoryName: string, maxPhotos: number = null, photosOnly: boolean = false): Promise<DirectoryDTO> {
    return new Promise<DirectoryDTO>((resolve, reject) => {
      relativeDirectoryName = this.normalizeDirPath(relativeDirectoryName);
      const directoryName = path.basename(relativeDirectoryName);
      const directoryParent = path.join(path.dirname(relativeDirectoryName), path.sep);
      const absoluteDirectoryName = path.join(ProjectPath.ImageFolder, relativeDirectoryName);

      const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
      const directory: DirectoryDTO = {
        id: null,
        parent: null,
        name: directoryName,
        path: directoryParent,
        lastModified: this.calcLastModified(stat),
        lastScanned: Date.now(),
        directories: [],
        isPartial: false,
        mediaCount: 0,
        media: [],
        metaFile: []
      };
      fs.readdir(absoluteDirectoryName, async (err, list: string[]) => {
        if (err) {
          return reject(err);
        }
        try {
          for (let i = 0; i < list.length; i++) {
            const file = list[i];
            const fullFilePath = path.normalize(path.join(absoluteDirectoryName, file));
            if (fs.statSync(fullFilePath).isDirectory()) {
              if (photosOnly === true) {
                continue;
              }
              const d = await DiskMangerWorker.scanDirectory(path.join(relativeDirectoryName, file),
                Config.Server.indexing.folderPreviewSize, true
              );
              d.lastScanned = 0; // it was not a fully scan
              d.isPartial = true;
              directory.directories.push(d);
            } else if (DiskMangerWorker.isImage(fullFilePath)) {
              directory.media.push(<PhotoDTO>{
                name: file,
                directory: null,
                metadata: await MetadataLoader.loadPhotoMetadata(fullFilePath)
              });

              if (maxPhotos != null && directory.media.length > maxPhotos) {
                break;
              }
            } else if (photosOnly === false && Config.Client.Video.enabled === true &&
              DiskMangerWorker.isVideo(fullFilePath)) {
              try {
                directory.media.push(<VideoDTO>{
                  name: file,
                  directory: null,
                  metadata: await MetadataLoader.loadVideoMetadata(fullFilePath)
                });
              } catch (e) {
                Logger.warn('Media loading error, skipping: ' + file + ', reason: ' + e.toString());
              }

            } else if (photosOnly === false && Config.Client.MetaFile.enabled === true &&
              DiskMangerWorker.isMetaFile(fullFilePath)) {
              directory.metaFile.push(<FileDTO>{
                name: file,
                directory: null,
              });

            }
          }

          directory.mediaCount = directory.media.length;

          return resolve(directory);
        } catch (err) {
          return reject({error: err});
        }

      });
    });

  }

  private static isImage(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return this.SupportedEXT.photo.indexOf(extension) !== -1;
  }

  private static isVideo(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return this.SupportedEXT.video.indexOf(extension) !== -1;
  }

  private static isMetaFile(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return this.SupportedEXT.metaFile.indexOf(extension) !== -1;
  }

}
