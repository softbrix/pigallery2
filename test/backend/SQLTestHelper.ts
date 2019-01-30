import {Config} from '../../common/config/private/Config';
import {DatabaseType} from '../../common/config/private/IPrivateConfig';
import * as fs from 'fs';
import * as path from 'path';
import {SQLConnection} from '../../backend/model/sql/SQLConnection';

declare let describe: any;
const savedDescribe = describe;

export class SQLTestHelper {

  static enable = {
    sqlite: true,
    mysql: true
  };
  public static readonly savedDescribe = savedDescribe;
  tempDir: string;
  dbPath: string;

  constructor(public dbType: DatabaseType) {
    this.tempDir = path.resolve(__dirname, './tmp');
    this.dbPath = path.resolve(__dirname, './tmp', 'test.db');

  }

  static describe(name: string, tests: (helper?: SQLTestHelper) => void) {
    savedDescribe(name, async () => {
      if (SQLTestHelper.enable.sqlite) {
        const helper = new SQLTestHelper(DatabaseType.sqlite);
        savedDescribe('sqlite', () => {
          return tests(helper);
        });
      }
      if (SQLTestHelper.enable.mysql) {
        const helper = new SQLTestHelper(DatabaseType.mysql);
        savedDescribe('mysql', function () {
          this.timeout(99999999);
          // @ts-ignore
          return tests(helper);
        });
      }
    });
  }

  public async initDB() {
    if (this.dbType === DatabaseType.sqlite) {
      await this.initSQLite();
    } else {
      await this.initMySQL();
    }
  }


  public async clearDB() {
    if (this.dbType === DatabaseType.sqlite) {
      await this.clearUpSQLite();
    } else {
      await this.clearUpMysql();
    }
  }

  private async initSQLite() {
    await this.resetSQLite();

    Config.Server.database.type = DatabaseType.sqlite;
    Config.Server.database.sqlite.storage = this.dbPath;
  }

  private async initMySQL() {
    Config.Server.database.type = DatabaseType.mysql;
    Config.Server.database.mysql.database = 'pigallery2_test';

    await this.resetMySQL();
  }

  private async resetSQLite() {
    await SQLConnection.close();

    if (fs.existsSync(this.dbPath)) {
      fs.unlinkSync(this.dbPath);
    }
    if (fs.existsSync(this.tempDir)) {
      fs.rmdirSync(this.tempDir);
    }
  }

  private async resetMySQL() {
    Config.Server.database.type = DatabaseType.mysql;
    Config.Server.database.mysql.database = 'pigallery2_test';
    const conn = await SQLConnection.getConnection();
    await conn.query('DROP DATABASE IF EXISTS ' + conn.options.database);
    await conn.query('CREATE DATABASE IF NOT EXISTS ' + conn.options.database);
    await SQLConnection.close();
  }

  private async clearUpMysql() {
    Config.Server.database.type = DatabaseType.mysql;
    Config.Server.database.mysql.database = 'pigallery2_test';
    const conn = await SQLConnection.getConnection();
    await conn.query('DROP DATABASE IF EXISTS ' + conn.options.database);
    await SQLConnection.close();
  }

  private async clearUpSQLite() {
    return this.resetSQLite();
  }
}
