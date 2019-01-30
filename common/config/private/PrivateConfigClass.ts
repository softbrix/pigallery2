import {PublicConfigClass} from '../public/ConfigClass';
import {DatabaseType, IPrivateConfig, ReIndexingSensitivity, ServerConfig, ThumbnailProcessingLib} from './IPrivateConfig';
import * as path from 'path';
import {ConfigLoader} from 'typeconfig';
import {Utils} from '../../Utils';
import {UserRoles} from '../../entities/UserDTO';

/**
 * This configuration will be only at backend
 */
export class PrivateConfigClass extends PublicConfigClass implements IPrivateConfig {

  public Server: ServerConfig = {
    port: 80,
    host: '0.0.0.0',
    imagesFolder: 'demo/images',
    thumbnail: {
      folder: 'demo/TEMP',
      processingLibrary: ThumbnailProcessingLib.sharp,
      qualityPriority: true
    },
    sessionTimeout: 1000 * 60 * 60 * 24 * 7,
    photoMetadataSize: 512 * 1024,
    database: {
      type: DatabaseType.sqlite,
      mysql: {
        host: '',
        username: '',
        password: '',
        database: ''

      },
      sqlite: {
        storage: 'sqlite.db'
      }
    },
    sharing: {
      updateTimeout: 1000 * 60 * 5
    },
    threading: {
      enable: true,
      thumbnailThreads: 0
    },
    indexing: {
      folderPreviewSize: 2,
      cachedFolderTimeout: 1000 * 60 * 60,
      reIndexingSensitivity: ReIndexingSensitivity.low
    },
    duplicates: {
      listingLimit: 1000
    }
  };
  private ConfigLoader: any;

  public setDatabaseType(type: DatabaseType) {
    this.Server.database.type = type;
    if (type === DatabaseType.memory) {
      this.Client.Search.enabled = false;
      this.Client.Sharing.enabled = false;
    }
  }

  public load() {
    ConfigLoader.loadBackendConfig(this,
      path.join(__dirname, './../../../config.json'),
      [['PORT', 'Server-port'],
        ['MYSQL_HOST', 'Server-database-mysql-host'],
        ['MYSQL_PASSWORD', 'Server-database-mysql-password'],
        ['MYSQL_USERNAME', 'Server-database-mysql-username'],
        ['MYSQL_DATABASE', 'Server-database-mysql-database']]);

    if (Utils.enumToArray(UserRoles).map(r => r.key).indexOf(this.Client.unAuthenticatedUserRole) === -1) {
      throw new Error('Unknown user role for Client.unAuthenticatedUserRole, found: ' + this.Client.unAuthenticatedUserRole);
    }

  }

  public save() {
    try {
      ConfigLoader.saveConfigFile(path.join(__dirname, './../../../config.json'), this);
    } catch (e) {
      throw new Error('Error during saving config: ' + e.toString());
    }
  }

  public original(): PrivateConfigClass {
    const cfg = new PrivateConfigClass();
    cfg.load();
    return cfg;
  }
}

