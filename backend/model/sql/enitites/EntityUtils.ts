import {Config} from '../../../../common/config/private/Config';
import {DatabaseType} from '../../../../common/config/private/IPrivateConfig';
import {ColumnOptions} from 'typeorm/decorator/options/ColumnOptions';

export class ColumnCharsetCS implements ColumnOptions {

  public get charset(): string {
    return Config.Server.database.type === DatabaseType.mysql ? 'utf8mb4' : null;
  }

  public get collation(): string {
    return Config.Server.database.type === DatabaseType.mysql ? 'utf8mb4_bin' : null;

  }
}

export const columnCharsetCS = new ColumnCharsetCS();
