import {PublicConfigClass} from '../public/ConfigClass';
import {
  DatabaseType,
  IPrivateConfig,
  LogLevel,
  ReIndexingSensitivity,
  ServerConfig,
  SQLLogLevel,
  ThumbnailProcessingLib
} from './IPrivateConfig';
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
      qualityPriority: true,
      personFaceMargin: 0.6
    },
    log: {
      level: LogLevel.info,
      sqlLevel: SQLLogLevel.error
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
    this.addComment();
    ConfigLoader.loadBackendConfig(this,
      path.join(__dirname, './../../../config.json'),
      [['PORT', 'Server-port'],
        ['MYSQL_HOST', 'Server-database-mysql-host'],
        ['MYSQL_PASSWORD', 'Server-database-mysql-password'],
        ['MYSQL_USERNAME', 'Server-database-mysql-username'],
        ['MYSQL_DATABASE', 'Server-database-mysql-database']]);
    this.removeComment();

    if (Utils.enumToArray(UserRoles).map(r => r.key).indexOf(this.Client.unAuthenticatedUserRole) === -1) {
      throw new Error('Unknown user role for Client.unAuthenticatedUserRole, found: ' + this.Client.unAuthenticatedUserRole);
    }
    if (Utils.enumToArray(LogLevel).map(r => r.key).indexOf(this.Server.log.level) === -1) {
      throw new Error('Unknown Server.log.level, found: ' + this.Server.log.level);
    }
    if (Utils.enumToArray(SQLLogLevel).map(r => r.key).indexOf(this.Server.log.sqlLevel) === -1) {
      throw new Error('Unknown Server.log.level, found: ' + this.Server.log.sqlLevel);
    }

  }

  public save() {
    try {
      this.addComment();
      ConfigLoader.saveConfigFile(path.join(__dirname, './../../../config.json'), this);
      this.removeComment();
    } catch (e) {
      throw new Error('Error during saving config: ' + e.toString());
    }
  }

  public original(): PrivateConfigClass {
    const cfg = new PrivateConfigClass();
    cfg.load();
    return cfg;
  }

  private addComment() {
    (<any>this)['__NOTE'] = 'NOTE: this config is not intended for manual edit, ' +
      'use the app UI instead as it has comments and descriptions.';
  }

  private removeComment() {
    delete (<any>this)['__NOTE'];
  }
}

