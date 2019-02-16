import 'reflect-metadata';
import {Connection, ConnectionOptions, createConnection, getConnection} from 'typeorm';
import {UserEntity} from './enitites/UserEntity';
import {UserRoles} from '../../../common/entities/UserDTO';
import {PhotoEntity} from './enitites/PhotoEntity';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {Config} from '../../../common/config/private/Config';
import {SharingEntity} from './enitites/SharingEntity';
import {DataBaseConfig, DatabaseType, SQLLogLevel} from '../../../common/config/private/IPrivateConfig';
import {PasswordHelper} from '../PasswordHelper';
import {ProjectPath} from '../../ProjectPath';
import {VersionEntity} from './enitites/VersionEntity';
import {Logger} from '../../Logger';
import {MediaEntity} from './enitites/MediaEntity';
import {VideoEntity} from './enitites/VideoEntity';
import {DataStructureVersion} from '../../../common/DataStructureVersion';
import {FileEntity} from './enitites/FileEntity';
import {FaceRegionEntry} from './enitites/FaceRegionEntry';
import {PersonEntry} from './enitites/PersonEntry';
import {Utils} from '../../../common/Utils';


export class SQLConnection {


  private static connection: Connection = null;

  constructor() {
  }

  public static async getConnection(): Promise<Connection> {
    if (this.connection == null) {
      const options: any = this.getDriver(Config.Server.database);
      //   options.name = 'main';
      options.entities = [
        UserEntity,
        FileEntity,
        FaceRegionEntry,
        PersonEntry,
        MediaEntity,
        PhotoEntity,
        VideoEntity,
        DirectoryEntity,
        SharingEntity,
        VersionEntity
      ];
      options.synchronize = false;
      if (Config.Server.log.sqlLevel !== SQLLogLevel.none) {
        options.logging = SQLLogLevel[Config.Server.log.sqlLevel];
      }

      this.connection = await this.createConnection(options);
      await SQLConnection.schemeSync(this.connection);
    }
    return this.connection;
  }

  public static async tryConnection(config: DataBaseConfig) {
    try {
      await getConnection('test').close();
    } catch (err) {
    }
    const options: any = this.getDriver(config);
    options.name = 'test';
    options.entities = [
      UserEntity,
      FileEntity,
      FaceRegionEntry,
      PersonEntry,
      MediaEntity,
      PhotoEntity,
      VideoEntity,
      DirectoryEntity,
      SharingEntity,
      VersionEntity
    ];
    options.synchronize = false;
    if (Config.Server.log.sqlLevel !== SQLLogLevel.none) {
      options.logging = SQLLogLevel[Config.Server.log.sqlLevel];
    }
    const conn = await this.createConnection(options);
    await SQLConnection.schemeSync(conn);
    await conn.close();
    return true;
  }

  public static async init(): Promise<void> {
    const connection = await this.getConnection();
    const userRepository = connection.getRepository(UserEntity);
    const admins = await userRepository.find({role: UserRoles.Admin});
    if (admins.length === 0) {
      const a = new UserEntity();
      a.name = 'admin';
      a.password = PasswordHelper.cryptPassword('admin');
      a.role = UserRoles.Admin;
      await userRepository.save(a);
    }

  }

  public static async close() {
    try {
      if (this.connection != null) {
        await this.connection.close();
        this.connection = null;
      }
    } catch (err) {
      console.error(err);
    }
  }

  private static async createConnection(options: ConnectionOptions) {
    if (options.type === 'sqlite') {
      return await createConnection(options);
    }
    try {
      return await createConnection(options);
    } catch (e) {
      if (e.sqlMessage === 'Unknown database \'' + options.database + '\'') {
        Logger.debug('creating database: ' + options.database);
        const tmpOption = Utils.clone(options);
        // @ts-ignore
        delete tmpOption.database;
        const tmpConn = await createConnection(tmpOption);
        await tmpConn.query('CREATE DATABASE IF NOT EXISTS ' + options.database);
        await tmpConn.close();
        return await createConnection(options);
      }
      throw e;
    }
  }

  private static async schemeSync(connection: Connection) {
    let version = null;
    try {
      version = await connection.getRepository(VersionEntity).findOne();
    } catch (ex) {
    }
    if (version && version.version === DataStructureVersion) {
      return;
    }
    Logger.info('Updating database scheme');
    if (!version) {
      version = new VersionEntity();
    }
    version.version = DataStructureVersion;

    let users: UserEntity[] = [];
    try {
      users = await connection.getRepository(UserEntity).createQueryBuilder('user').getMany();
    } catch (ex) {
    }
    await connection.dropDatabase();
    await connection.synchronize();
    await connection.getRepository(VersionEntity).save(version);
    try {
      await connection.getRepository(UserEntity).save(users);
    } catch (e) {
      await connection.dropDatabase();
      await connection.synchronize();
      await connection.getRepository(VersionEntity).save(version);
      Logger.warn('Could not move users to the new db scheme, deleting them. Details:' + e.toString());
    }
  }

  private static getDriver(config: DataBaseConfig): ConnectionOptions {
    let driver: ConnectionOptions = null;
    if (config.type === DatabaseType.mysql) {
      driver = {
        type: 'mysql',
        host: config.mysql.host,
        port: 3306,
        username: config.mysql.username,
        password: config.mysql.password,
        database: config.mysql.database,
        charset: 'utf8'
      };
    } else if (config.type === DatabaseType.sqlite) {
      driver = {
        type: 'sqlite',
        database: ProjectPath.getAbsolutePath(config.sqlite.storage)
      };
    }
    return driver;
  }


}
