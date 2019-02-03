import {expect} from 'chai';
import * as fs from 'fs';
import {Config} from '../../../../../common/config/private/Config';
import {ReIndexingSensitivity} from '../../../../../common/config/private/IPrivateConfig';
import {SQLConnection} from '../../../../../backend/model/sql/SQLConnection';
import {GalleryManager} from '../../../../../backend/model/sql/GalleryManager';
import {DirectoryDTO} from '../../../../../common/entities/DirectoryDTO';
import {TestHelper} from './TestHelper';
import {Connection} from 'typeorm';
import {DirectoryEntity} from '../../../../../backend/model/sql/enitites/DirectoryEntity';
import {Utils} from '../../../../../common/Utils';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';
import {FileDTO} from '../../../../../common/entities/FileDTO';
import {IndexingManager} from '../../../../../backend/model/sql/IndexingManager';
import {ObjectManagerRepository} from '../../../../../backend/model/ObjectManagerRepository';
import {PersonManager} from '../../../../../backend/model/sql/PersonManager';
import {SQLTestHelper} from '../../../SQLTestHelper';

class GalleryManagerTest extends GalleryManager {


  public async selectParentDir(connection: Connection, directoryName: string, directoryParent: string): Promise<DirectoryEntity> {
    return super.selectParentDir(connection, directoryName, directoryParent);
  }

  public async fillParentDir(connection: Connection, dir: DirectoryEntity): Promise<void> {
    return super.fillParentDir(connection, dir);
  }

}

class IndexingManagerTest extends IndexingManager {


  public async queueForSave(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.queueForSave(scannedDirectory);
  }

  public async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}

// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
describe = SQLTestHelper.describe;

describe('IndexingManager', (sqlHelper: SQLTestHelper) => {


  beforeEach(async () => {
    await sqlHelper.initDB();
    ObjectManagerRepository.getInstance().PersonManager = new PersonManager();
  });


  after(async () => {
    await sqlHelper.clearDB();
  });

  const removeIds = (dir: DirectoryDTO) => {
    delete dir.id;
    dir.media.forEach((media: MediaDTO) => {
      delete media.id;
    });
    if (dir.metaFile) {
      if (dir.metaFile.length === 0) {
        delete dir.metaFile;
      } else {
        dir.metaFile.forEach((file: FileDTO) => {
          delete file.id;
        });
      }
    }
    if (dir.directories) {
      dir.directories.forEach((directory: DirectoryDTO) => {
        removeIds(directory);
      });
    }
  };

  it('should save parent directory', async () => {
    const gm = new GalleryManagerTest();
    const im = new IndexingManagerTest();

    const parent = TestHelper.getRandomizedDirectoryEntry();
    const p1 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo1');
    const p2 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo2');
    const gpx = TestHelper.getRandomizedGPXEntry(parent, 'GPX1');
    const subDir = TestHelper.getRandomizedDirectoryEntry(parent, 'subDir');
    const sp1 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto1', 0);
    const sp2 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto2', 0);


    DirectoryDTO.removeReferences(parent);
    await im.saveToDB(Utils.clone(parent));

    const conn = await SQLConnection.getConnection();
    const selected = await gm.selectParentDir(conn, parent.name, parent.path);
    await gm.fillParentDir(conn, selected);

    DirectoryDTO.removeReferences(selected);
    removeIds(selected);
    subDir.isPartial = true;
    delete subDir.directories;
    delete subDir.metaFile;
    expect(Utils.clone(Utils.removeNullOrEmptyObj(selected)))
      .to.deep.equal(Utils.clone(Utils.removeNullOrEmptyObj(parent)));
  });


  it('should save photos with extreme parameters', async () => {
    const gm = new GalleryManagerTest();
    const im = new IndexingManagerTest();

    const parent = TestHelper.getRandomizedDirectoryEntry();
    const p1 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo1');
    const p2 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo2');
    const minFloat = 1.1 * Math.pow(10, -38);
    const maxFloat = 3.4 * Math.pow(10, +38);
    p1.metadata.cameraData.fStop = minFloat;
    p2.metadata.cameraData.fStop = maxFloat;
    p1.metadata.cameraData.exposure = minFloat;
    p2.metadata.cameraData.exposure = maxFloat;
    p1.metadata.cameraData.focalLength = minFloat;
    p2.metadata.cameraData.focalLength = maxFloat;
    p1.metadata.positionData.GPSData.altitude = -2147483647;
    p2.metadata.positionData.GPSData.altitude = 2147483646;
    p1.metadata.positionData.GPSData.latitude = maxFloat;
    p2.metadata.positionData.GPSData.latitude = minFloat;
    p1.metadata.positionData.GPSData.longitude = maxFloat;
    p2.metadata.positionData.GPSData.longitude = minFloat;


    DirectoryDTO.removeReferences(parent);
    await im.saveToDB(Utils.clone(parent));

    const conn = await SQLConnection.getConnection();
    const selected = await gm.selectParentDir(conn, parent.name, parent.path);
    await gm.fillParentDir(conn, selected);

    DirectoryDTO.removeReferences(selected);
    removeIds(selected);
    expect(Utils.clone(Utils.removeNullOrEmptyObj(selected)))
      .to.deep.equal(Utils.clone(Utils.removeNullOrEmptyObj(parent)));
  });

  it('should skip meta files', async () => {
    const gm = new GalleryManagerTest();
    const im = new IndexingManagerTest();
    const parent = TestHelper.getRandomizedDirectoryEntry();
    const p1 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo1');
    const p2 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo2');
    const gpx = TestHelper.getRandomizedGPXEntry(parent, 'GPX1');
    DirectoryDTO.removeReferences(parent);
    Config.Client.MetaFile.enabled = true;
    await im.saveToDB(Utils.clone(parent));

    Config.Client.MetaFile.enabled = false;
    const conn = await SQLConnection.getConnection();
    const selected = await gm.selectParentDir(conn, parent.name, parent.path);
    await gm.fillParentDir(conn, selected);

    delete parent.metaFile;
    DirectoryDTO.removeReferences(selected);
    removeIds(selected);
    expect(Utils.clone(Utils.removeNullOrEmptyObj(selected)))
      .to.deep.equal(Utils.clone(Utils.removeNullOrEmptyObj(parent)));
  });

  it('should update sub directory', async () => {
    const gm = new GalleryManagerTest();
    const im = new IndexingManagerTest();

    const parent = TestHelper.getRandomizedDirectoryEntry();
    parent.name = 'parent';
    const p1 = TestHelper.getRandomizedPhotoEntry(parent);
    const subDir = TestHelper.getRandomizedDirectoryEntry(parent, 'subDir');
    subDir.name = 'subDir';
    const sp1 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto1');

    DirectoryDTO.removeReferences(parent);
    await im.saveToDB(Utils.clone(parent));

    const sp2 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto2');
    const sp3 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto3');

    DirectoryDTO.removeReferences(subDir);
    await im.saveToDB(Utils.clone(subDir));

    const conn = await SQLConnection.getConnection();
    const selected = await gm.selectParentDir(conn, subDir.name, subDir.path);
    await gm.fillParentDir(conn, selected);

    // subDir.isPartial = true;
    //  delete subDir.directories;
    DirectoryDTO.removeReferences(selected);
    delete subDir.parent;
    delete subDir.metaFile;
    removeIds(selected);
    // selected.directories[0].parent = selected;
    expect(Utils.clone(Utils.removeNullOrEmptyObj(selected)))
      .to.deep.equal(Utils.clone(Utils.removeNullOrEmptyObj(subDir)));
  });

  it('should avoid race condition', async () => {
    const conn = await SQLConnection.getConnection();
    const gm = new GalleryManagerTest();
    const im = new IndexingManagerTest();
    Config.Client.MetaFile.enabled = true;
    const parent = TestHelper.getRandomizedDirectoryEntry();
    const p1 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo1');
    const p2 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo2');
    const gpx = TestHelper.getRandomizedGPXEntry(parent, 'GPX1');
    const subDir = TestHelper.getRandomizedDirectoryEntry(parent, 'subDir');
    const sp1 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto1', 1);
    const sp2 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto2', 1);


    DirectoryDTO.removeReferences(parent);
    const s1 = im.queueForSave(Utils.clone(parent));
    const s2 = im.queueForSave(Utils.clone(parent));
    const s3 = im.queueForSave(Utils.clone(parent));

    await Promise.all([s1, s2, s3]);

    const selected = await gm.selectParentDir(conn, parent.name, parent.path);
    await gm.fillParentDir(conn, selected);

    DirectoryDTO.removeReferences(selected);
    removeIds(selected);
    subDir.isPartial = true;
    delete subDir.directories;
    delete subDir.metaFile;
    delete sp1.metadata.faces;
    delete sp2.metadata.faces;
    expect(Utils.clone(Utils.removeNullOrEmptyObj(selected)))
      .to.deep.equal(Utils.clone(Utils.removeNullOrEmptyObj(parent)));
  });


  (it('should save 1500 photos', async () => {
    const conn = await SQLConnection.getConnection();
    const gm = new GalleryManagerTest();
    const im = new IndexingManagerTest();
    Config.Client.MetaFile.enabled = true;
    const parent = TestHelper.getRandomizedDirectoryEntry();
    DirectoryDTO.removeReferences(parent);
    await im.saveToDB(Utils.clone(parent));
    const subDir = TestHelper.getRandomizedDirectoryEntry(parent, 'subDir');
    for (let i = 0; i < 1500; i++) {
      TestHelper.getRandomizedPhotoEntry(subDir, 'p' + i);
    }

    DirectoryDTO.removeReferences(parent);
    await im.saveToDB(subDir);


    const selected = await gm.selectParentDir(conn, subDir.name, subDir.path);
    expect(selected.media.length).to.deep.equal(subDir.media.length);
  }) as any).timeout(40000);

  SQLTestHelper.savedDescribe('Test listDirectory', () => {
    const statSync = fs.statSync;
    let dirTime = 0;
    const indexedTime = {
      lastScanned: 0,
      lastModified: 0
    };

    beforeEach(() => {
      dirTime = 0;

      ObjectManagerRepository.getInstance().IndexingManager = new IndexingManagerTest();
      indexedTime.lastModified = 0;
      indexedTime.lastScanned = 0;
    });

    afterEach(() => {
      // @ts-ignore
      fs.statSync = statSync;
    });

    it('with re indexing severity low', async () => {
      Config.Server.indexing.reIndexingSensitivity = ReIndexingSensitivity.low;

      // @ts-ignore
      fs.statSync = () => ({ctime: new Date(dirTime), mtime: new Date(dirTime)});
      const gm = new GalleryManagerTest();
      gm.selectParentDir = (connection: Connection, directoryName: string, directoryParent: string) => {
        return Promise.resolve(<any>indexedTime);
      };
      gm.fillParentDir = (connection: Connection, dir: DirectoryEntity) => {
        return Promise.resolve();
      };

      ObjectManagerRepository.getInstance().IndexingManager.indexDirectory = (...args) => {
        return <any>Promise.resolve('indexing');
      };

      indexedTime.lastScanned = null;
      expect(await gm.listDirectory('./')).to.be.equal('indexing');
      indexedTime.lastModified = 0;
      dirTime = 1;
      expect(await gm.listDirectory('./')).to.be.equal('indexing');
      indexedTime.lastScanned = 10;
      indexedTime.lastModified = 1;
      dirTime = 1;
      expect(await gm.listDirectory('./')).to.be.equal(indexedTime);
      expect(await gm.listDirectory('./', 1, 10))
        .to.be.equal(null);


    });
  });

});
