import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {SQLConnection} from './SQLConnection';
import {DiskManager} from '../DiskManger';
import {PhotoEntity} from './enitites/PhotoEntity';
import {Utils} from '../../../common/Utils';
import {FaceRegion, PhotoMetadata} from '../../../common/entities/PhotoDTO';
import {Connection, Repository} from 'typeorm';
import {MediaEntity} from './enitites/MediaEntity';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {VideoEntity} from './enitites/VideoEntity';
import {FileEntity} from './enitites/FileEntity';
import {FileDTO} from '../../../common/entities/FileDTO';
import {NotificationManager} from '../NotifocationManager';
import {FaceRegionEntry} from './enitites/FaceRegionEntry';
import {ObjectManagerRepository} from '../ObjectManagerRepository';
import {IIndexingManager} from '../interfaces/IIndexingManager';

const LOG_TAG = '[IndexingManager]';

export class IndexingManager implements IIndexingManager {

  private savingQueue: DirectoryDTO[] = [];
  private isSaving = false;

  public indexDirectory(relativeDirectoryName: string): Promise<DirectoryDTO> {
    return new Promise(async (resolve, reject) => {
      try {
        const scannedDirectory = await DiskManager.scanDirectory(relativeDirectoryName);

        // returning with the result
        scannedDirectory.media.forEach(p => p.readyThumbnails = []);
        resolve(scannedDirectory);

        this.queueForSave(scannedDirectory).catch(console.error);

      } catch (error) {
        NotificationManager.warning('Unknown indexing error for: ' + relativeDirectoryName, error.toString());
        console.error(error);
        return reject(error);
      }

    });
  }

  // Todo fix it, once typeorm support connection pools ofr sqlite
  protected async queueForSave(scannedDirectory: DirectoryDTO) {
    if (this.savingQueue.findIndex(dir => dir.name === scannedDirectory.name &&
      dir.path === scannedDirectory.path &&
      dir.lastModified === scannedDirectory.lastModified &&
      dir.lastScanned === scannedDirectory.lastScanned &&
      (dir.media || dir.media.length) === (scannedDirectory.media || scannedDirectory.media.length) &&
      (dir.metaFile || dir.metaFile.length) === (scannedDirectory.metaFile || scannedDirectory.metaFile.length)) !== -1) {
      return;
    }
    this.savingQueue.push(scannedDirectory);
    while (this.isSaving === false && this.savingQueue.length > 0) {
      await this.saveToDB(this.savingQueue[0]);
      this.savingQueue.shift();
    }

  }

  protected async saveParentDir(connection: Connection, scannedDirectory: DirectoryDTO): Promise<number> {
    const directoryRepository = connection.getRepository(DirectoryEntity);

    const currentDir: DirectoryEntity = await directoryRepository.createQueryBuilder('directory')
      .where('directory.name = :name AND directory.path = :path', {
        name: scannedDirectory.name,
        path: scannedDirectory.path
      }).getOne();
    if (!!currentDir) {// Updated parent dir (if it was in the DB previously)
      currentDir.lastModified = scannedDirectory.lastModified;
      currentDir.lastScanned = scannedDirectory.lastScanned;
      currentDir.mediaCount = scannedDirectory.mediaCount;
      await directoryRepository.save(currentDir);
      return currentDir.id;

    } else {
      return (await directoryRepository.insert(<DirectoryEntity>{
        mediaCount: scannedDirectory.mediaCount,
        lastModified: scannedDirectory.lastModified,
        lastScanned: scannedDirectory.lastScanned,
        name: scannedDirectory.name,
        path: scannedDirectory.path
      })).identifiers[0].id;
    }
  }

  protected async saveChildDirs(connection: Connection, currentDirId: number, scannedDirectory: DirectoryDTO) {
    const directoryRepository = connection.getRepository(DirectoryEntity);
    // TODO: fix when first opened directory is not root
    // save subdirectories
    const childDirectories = await directoryRepository.createQueryBuilder('directory')
      .where('directory.parent = :dir', {
        dir: currentDirId
      }).getMany();

    for (let i = 0; i < scannedDirectory.directories.length; i++) {
      // Was this child Dir already indexed before?
      let directory: DirectoryEntity = null;
      for (let j = 0; j < childDirectories.length; j++) {
        if (childDirectories[j].name === scannedDirectory.directories[i].name) {
          directory = childDirectories[j];
          childDirectories.splice(j, 1);
          break;
        }
      }

      if (directory != null) { // update existing directory
        if (!directory.parent || !directory.parent.id) { // set parent if not set yet
          directory.parent = <any>{id: currentDirId};
          delete directory.media;
          await directoryRepository.save(directory);
        }
      } else { // dir does not exists yet
        scannedDirectory.directories[i].parent = <any>{id: currentDirId};
        (<DirectoryEntity>scannedDirectory.directories[i]).lastScanned = null; // new child dir, not fully scanned yet
        const d = await directoryRepository.insert(<DirectoryEntity>scannedDirectory.directories[i]);

        await this.saveMedia(connection, d.identifiers[0].id, scannedDirectory.directories[i].media);
      }
    }

    // Remove child Dirs that are not anymore in the parent dir
    await directoryRepository.remove(childDirectories, {chunk: Math.max(Math.ceil(childDirectories.length / 500), 1)});

  }

  protected async saveMetaFiles(connection: Connection, currentDirID: number, scannedDirectory: DirectoryDTO) {
    const fileRepository = connection.getRepository(FileEntity);
    // save files
    const indexedMetaFiles = await fileRepository.createQueryBuilder('file')
      .where('file.directory = :dir', {
        dir: currentDirID
      }).getMany();


    const metaFilesToSave = [];
    for (let i = 0; i < scannedDirectory.metaFile.length; i++) {
      let metaFile: FileDTO = null;
      for (let j = 0; j < indexedMetaFiles.length; j++) {
        if (indexedMetaFiles[j].name === scannedDirectory.metaFile[i].name) {
          metaFile = indexedMetaFiles[j];
          indexedMetaFiles.splice(j, 1);
          break;
        }
      }
      if (metaFile == null) { // not in DB yet
        scannedDirectory.metaFile[i].directory = null;
        metaFile = Utils.clone(scannedDirectory.metaFile[i]);
        scannedDirectory.metaFile[i].directory = scannedDirectory;
        metaFile.directory = <any>{id: currentDirID};
        metaFilesToSave.push(metaFile);
      }
    }
    await fileRepository.save(metaFilesToSave, {chunk: Math.max(Math.ceil(metaFilesToSave.length / 500), 1)});
    await fileRepository.remove(indexedMetaFiles, {chunk: Math.max(Math.ceil(indexedMetaFiles.length / 500), 1)});
  }

  protected async saveMedia(connection: Connection, parentDirId: number, media: MediaDTO[]) {
    const mediaRepository = connection.getRepository(MediaEntity);
    const photoRepository = connection.getRepository(PhotoEntity);
    const videoRepository = connection.getRepository(VideoEntity);
    // save media
    let indexedMedia = (await mediaRepository.createQueryBuilder('media')
      .where('media.directory = :dir', {
        dir: parentDirId
      })
      .getMany());

    const mediaChange: any = {
      saveP: [],
      saveV: [],
      insertP: [],
      insertV: []
    };
    const facesPerPhoto: { faces: FaceRegionEntry[], mediaName: string }[] = [];
    for (let i = 0; i < media.length; i++) {
      let mediaItem: MediaEntity = null;
      for (let j = 0; j < indexedMedia.length; j++) {
        if (indexedMedia[j].name === media[i].name) {
          mediaItem = indexedMedia[j];
          indexedMedia.splice(j, 1);
          break;
        }
      }

      const scannedFaces = (<PhotoMetadata>media[i].metadata).faces || [];
      delete (<PhotoMetadata>media[i].metadata).faces;

      // let mediaItemId: number = null;
      if (mediaItem == null) { // not in DB yet
        media[i].directory = null;
        mediaItem = <any>Utils.clone(media[i]);
        mediaItem.directory = <any>{id: parentDirId};
        (MediaDTO.isPhoto(mediaItem) ? mediaChange.insertP : mediaChange.insertV).push(mediaItem);
      } else {
        delete (<PhotoMetadata>mediaItem.metadata).faces;
        if (!Utils.equalsFilter(mediaItem.metadata, media[i].metadata)) {
          mediaItem.metadata = <any>media[i].metadata;
          (MediaDTO.isPhoto(mediaItem) ? mediaChange.saveP : mediaChange.saveV).push(mediaItem);

        }
      }

      facesPerPhoto.push({faces: scannedFaces as FaceRegionEntry[], mediaName: mediaItem.name});
    }

    await this.saveChunk(photoRepository, mediaChange.saveP, 100);
    await this.saveChunk(videoRepository, mediaChange.saveV, 100);
    await this.saveChunk(photoRepository, mediaChange.insertP, 100);
    await this.saveChunk(videoRepository, mediaChange.insertV, 100);

    indexedMedia = (await mediaRepository.createQueryBuilder('media')
      .where('media.directory = :dir', {
        dir: parentDirId
      })
      .select(['media.name', 'media.id'])
      .getMany());

    const faces: FaceRegionEntry[] = [];
    facesPerPhoto.forEach(group => {
      const mIndex = indexedMedia.findIndex(m => m.name === group.mediaName);
      group.faces.forEach((sf: FaceRegionEntry) => sf.media = <any>{id: indexedMedia[mIndex].id});

      faces.push(...group.faces);
      indexedMedia.splice(mIndex, 1);
    });

    await this.saveFaces(connection, parentDirId, faces);
    await mediaRepository.remove(indexedMedia);
  }

  protected async saveFaces(connection: Connection, parentDirId: number, scannedFaces: FaceRegion[]) {
    const faceRepository = connection.getRepository(FaceRegionEntry);

    const persons: string[] = [];

    for (let i = 0; i < scannedFaces.length; i++) {
      if (persons.indexOf(scannedFaces[i].name) === -1) {
        persons.push(scannedFaces[i].name);
      }
    }
    await ObjectManagerRepository.getInstance().PersonManager.saveAll(persons);


    const indexedFaces = await faceRepository.createQueryBuilder('face')
      .leftJoin('face.media', 'media')
      .where('media.directory = :directory', {
        directory: parentDirId
      })
      .leftJoinAndSelect('face.person', 'person')
      .getMany();


    const faceToInsert = [];
    for (let i = 0; i < scannedFaces.length; i++) {
      let face: FaceRegionEntry = null;
      for (let j = 0; j < indexedFaces.length; j++) {
        if (indexedFaces[j].box.height === scannedFaces[i].box.height &&
          indexedFaces[j].box.width === scannedFaces[i].box.width &&
          indexedFaces[j].box.x === scannedFaces[i].box.x &&
          indexedFaces[j].box.y === scannedFaces[i].box.y &&
          indexedFaces[j].person.name === scannedFaces[i].name) {
          face = indexedFaces[j];
          indexedFaces.splice(j, 1);
          break;
        }
      }

      if (face == null) {
        (<FaceRegionEntry>scannedFaces[i]).person = await ObjectManagerRepository.getInstance().PersonManager.get(scannedFaces[i].name);
        faceToInsert.push(scannedFaces[i]);
      }
    }
    if (faceToInsert.length > 0) {
      await this.insertChunk(faceRepository, faceToInsert, 100);
    }
    await faceRepository.remove(indexedFaces, {chunk: Math.max(Math.ceil(indexedFaces.length / 500), 1)});

  }

  protected async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    this.isSaving = true;
    try {
      const connection = await SQLConnection.getConnection();
      const currentDirId: number = await this.saveParentDir(connection, scannedDirectory);
      await this.saveChildDirs(connection, currentDirId, scannedDirectory);
      await this.saveMedia(connection, currentDirId, scannedDirectory.media);
      await this.saveMetaFiles(connection, currentDirId, scannedDirectory);
    } catch (e) {
      throw e;
    } finally {
      this.isSaving = false;
    }
  }

  private async saveChunk<T>(repository: Repository<any>, entities: T[], size: number): Promise<T[]> {
    if (entities.length === 0) {
      return [];
    }
    if (entities.length < size) {
      return await repository.save(entities);
    }
    let list: T[] = [];
    for (let i = 0; i < entities.length / size; i++) {
      list = list.concat(await repository.save(entities.slice(i * size, (i + 1) * size)));
    }
    return list;
  }

  private async insertChunk<T>(repository: Repository<any>, entities: T[], size: number): Promise<number[]> {
    if (entities.length === 0) {
      return [];
    }
    if (entities.length < size) {
      return (await repository.insert(entities)).identifiers.map((i: any) => i.id);
    }
    let list: number[] = [];
    for (let i = 0; i < entities.length / size; i++) {
      list = list.concat((await repository.insert(entities.slice(i * size, (i + 1) * size))).identifiers.map(ids => ids.id));
    }
    return list;
  }
}
