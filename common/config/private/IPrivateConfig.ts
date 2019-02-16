import {ClientConfig} from '../public/ConfigClass';

export enum DatabaseType {
  memory = 1, mysql = 2, sqlite = 3
}

export enum LogLevel {
  error = 1, warn = 2, info = 3, debug = 4, verbose = 5, silly = 6
}

export enum SQLLogLevel {
  none = 1, error = 2, all = 3
}

export enum ThumbnailProcessingLib {
  Jimp = 1,
  gm = 2,
  sharp = 3
}

export interface MySQLConfig {
  host: string;
  database: string;
  username: string;
  password: string;
}

export interface SQLiteConfig {
  storage: string;
}

export interface DataBaseConfig {
  type: DatabaseType;
  mysql?: MySQLConfig;
  sqlite?: SQLiteConfig;
}

export interface ThumbnailConfig {
  folder: string;
  processingLibrary: ThumbnailProcessingLib;
  qualityPriority: boolean;
  personFaceMargin: number; // in ration [0-1]
}

export interface SharingConfig {
  updateTimeout: number;
}

export enum ReIndexingSensitivity {
  low = 1, medium = 2, high = 3
}

export interface IndexingConfig {
  folderPreviewSize: number;
  cachedFolderTimeout: number; // Do not rescans the folder if seems ok
  reIndexingSensitivity: ReIndexingSensitivity;
}

export interface ThreadingConfig {
  enable: boolean;
  thumbnailThreads: number;
}

export interface DuplicatesConfig {
  listingLimit: number; // maximum number of duplicates to list
}

export interface LogConfig {
  level: LogLevel;
  sqlLevel: SQLLogLevel;
}

export interface ServerConfig {
  port: number;
  host: string;
  imagesFolder: string;
  thumbnail: ThumbnailConfig;
  threading: ThreadingConfig;
  database: DataBaseConfig;
  sharing: SharingConfig;
  sessionTimeout: number;
  indexing: IndexingConfig;
  photoMetadataSize: number;
  duplicates: DuplicatesConfig;
  log: LogConfig;
}

export interface IPrivateConfig {
  Server: ServerConfig;
  Client: ClientConfig.Config;
}
