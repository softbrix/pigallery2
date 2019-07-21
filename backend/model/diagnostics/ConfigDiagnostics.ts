import {Config} from '../../../common/config/private/Config';
import {
  DataBaseConfig,
  DatabaseType,
  IPrivateConfig,
  ThumbnailConfig,
  ThumbnailProcessingLib
} from '../../../common/config/private/IPrivateConfig';
import {Logger} from '../../Logger';
import {NotificationManager} from '../NotifocationManager';
import {ProjectPath} from '../../ProjectPath';
import {SQLConnection} from '../sql/SQLConnection';
import * as fs from 'fs';
import {ClientConfig} from '../../../common/config/public/ConfigClass';
import {FFmpegFactory} from '../FFmpegFactory';
import VideoConfig = ClientConfig.VideoConfig;
import MetaFileConfig = ClientConfig.MetaFileConfig;

const LOG_TAG = '[ConfigDiagnostics]';

export class ConfigDiagnostics {

  static async testDatabase(databaseConfig: DataBaseConfig) {
    if (databaseConfig.type !== DatabaseType.memory) {
      await SQLConnection.tryConnection(databaseConfig);
    }
  }


  static async testMetaFileConfig(metaFileConfig: MetaFileConfig, config: IPrivateConfig) {
    if (metaFileConfig.enabled === true &&
      config.Client.Map.enabled === false) {
      throw new Error('*.gpx meta files are not supported without MAP');
    }
  }


  static testVideoConfig(videoConfig: VideoConfig) {
    return new Promise((resolve, reject) => {
      try {
        if (videoConfig.enabled === true) {
          const ffmpeg = FFmpegFactory.get();
          ffmpeg().getAvailableCodecs((err: Error) => {
            if (err) {
              return reject(new Error('Error accessing ffmpeg, cant find executable: ' + err.toString()));
            }
            ffmpeg(__dirname + '/blank.jpg').ffprobe((err2: Error) => {
              if (err2) {
                return reject(new Error('Error accessing ffmpeg-probe, cant find executable: ' + err2.toString()));
              }
              return resolve();
            });
          });
        } else {
          return resolve();
        }
      } catch (e) {
        return reject(new Error('unkown video error: ' + e.toString()));
      }
    });
  }

  static async testThumbnailLib(processingLibrary: ThumbnailProcessingLib) {
    switch (processingLibrary) {
      case ThumbnailProcessingLib.sharp:
        const sharp = require('sharp');
        sharp();
        break;
      case  ThumbnailProcessingLib.gm:
        const gm = require('gm');
        await new Promise((resolve, reject) => {
          gm(ProjectPath.FrontendFolder + '/assets/icon.png').size((err: Error) => {
            if (err) {
              return reject(err.toString());
            }
            return resolve();
          });
        });
        break;
    }
  }

  static testThumbnailFolder(folder: string) {
    return new Promise((resolve, reject) => {
      fs.access(folder, fs.constants.W_OK, (err) => {
        if (err) {
          reject({message: 'Error during getting write access to temp folder', error: err.toString()});
        }
      });
      resolve();
    });
  }

  static testImageFolder(folder: string) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(folder)) {
        reject('Images folder not exists: \'' + folder + '\'');
      }
      fs.access(folder, fs.constants.R_OK, (err) => {
        if (err) {
          reject({message: 'Error during getting read access to images folder', error: err.toString()});
        }
      });
      resolve();
    });
  }


  static async testServerThumbnailConfig(thumbnailConfig: ThumbnailConfig) {
    await ConfigDiagnostics.testThumbnailLib(thumbnailConfig.processingLibrary);
    await ConfigDiagnostics.testThumbnailFolder(thumbnailConfig.folder);
  }

  static async testClientThumbnailConfig(thumbnailConfig: ClientConfig.ThumbnailConfig) {
    if (isNaN(thumbnailConfig.iconSize) || thumbnailConfig.iconSize <= 0) {
      throw new Error('IconSize has to be >= 0 integer, got: ' + thumbnailConfig.iconSize);
    }

    if (!thumbnailConfig.thumbnailSizes.length) {
      throw new Error('At least one thumbnail size is needed');
    }
    for (let i = 0; i < thumbnailConfig.thumbnailSizes.length; i++) {
      if (isNaN(thumbnailConfig.thumbnailSizes[i]) || thumbnailConfig.thumbnailSizes[i] <= 0) {
        throw new Error('Thumbnail size has to be >= 0 integer, got: ' + thumbnailConfig.thumbnailSizes[i]);
      }
    }
  }


  static async testFacesConfig(faces: ClientConfig.FacesConfig, config: IPrivateConfig) {
    if (faces.enabled === true) {
      if (config.Server.database.type === DatabaseType.memory) {
        throw new Error('Memory Database do not support faces');
      }
      if (config.Client.Search.enabled === false) {
        throw new Error('Faces support needs enabled search');
      }
    }
  }

  static async testSearchConfig(search: ClientConfig.SearchConfig, config: IPrivateConfig) {
    if (search.enabled === true &&
      config.Server.database.type === DatabaseType.memory) {
      throw new Error('Memory Database do not support searching');
    }
  }


  static async testSharingConfig(sharing: ClientConfig.SharingConfig, config: IPrivateConfig) {
    if (sharing.enabled === true &&
      config.Server.database.type === DatabaseType.memory) {
      throw new Error('Memory Database do not support sharing');
    }
    if (sharing.enabled === true &&
      config.Client.authenticationRequired === false) {
      throw new Error('In case of no authentication, sharing is not supported');
    }
  }

  static async testRandomPhotoConfig(sharing: ClientConfig.RandomPhotoConfig, config: IPrivateConfig) {
    if (sharing.enabled === true &&
      config.Server.database.type === DatabaseType.memory) {
      throw new Error('Memory Database do not support sharing');
    }
  }


  static async testMapConfig(map: ClientConfig.MapConfig): Promise<void> {
    if (map.enabled === false) {
      return;
    }
    if (map.mapProvider === ClientConfig.MapProviders.Mapbox &&
      (!map.mapboxAccessToken || map.mapboxAccessToken.length === 0)) {
      throw new Error('Mapbox needs a valid api key.');
    }
    if (map.mapProvider === ClientConfig.MapProviders.Custom &&
      (!map.customLayers || map.customLayers.length === 0)) {
      throw new Error('Custom maps need at least one valid layer');
    }
    if (map.mapProvider === ClientConfig.MapProviders.Custom) {
      map.customLayers.forEach(l => {
        if (!l.url || l.url.length === 0) {
          throw new Error('Custom maps url need to be a valid layer');
        }
      });
    }
  }


  static async runDiagnostics() {

    if (Config.Server.database.type !== DatabaseType.memory) {
      try {
        await ConfigDiagnostics.testDatabase(Config.Server.database);
      } catch (ex) {
        const err: Error = ex;
        Logger.warn(LOG_TAG, '[SQL error]', err.toString());
        Logger.warn(LOG_TAG, 'Error during initializing SQL falling back temporally to memory DB');
        NotificationManager.warning('Error during initializing SQL falling back temporally to memory DB', err.toString());
        Config.setDatabaseType(DatabaseType.memory);
      }
    }

    if (Config.Server.thumbnail.processingLibrary !== ThumbnailProcessingLib.Jimp) {
      try {
        await ConfigDiagnostics.testThumbnailLib(Config.Server.thumbnail.processingLibrary);
      } catch (ex) {
        const err: Error = ex;
        NotificationManager.warning('Thumbnail hardware acceleration is not possible.' +
          ' \'' + ThumbnailProcessingLib[Config.Server.thumbnail.processingLibrary] + '\' node module is not found.' +
          ' Falling back temporally to JS based thumbnail generation', err.toString());
        Logger.warn(LOG_TAG, '[Thumbnail hardware acceleration] module error: ', err.toString());
        Logger.warn(LOG_TAG, 'Thumbnail hardware acceleration is not possible.' +
          ' \'' + ThumbnailProcessingLib[Config.Server.thumbnail.processingLibrary] + '\' node module is not found.' +
          ' Falling back temporally to JS based thumbnail generation');
        Config.Server.thumbnail.processingLibrary = ThumbnailProcessingLib.Jimp;
      }
    }

    try {
      await ConfigDiagnostics.testThumbnailFolder(Config.Server.thumbnail.folder);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.error('Thumbnail folder error', err.toString());
      Logger.error(LOG_TAG, 'Thumbnail folder error', err.toString());
    }


    try {
      await ConfigDiagnostics.testVideoConfig(Config.Client.Video);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.warning('Video support error, switching off..', err.toString());
      Logger.warn(LOG_TAG, 'Video support error, switching off..', err.toString());
      Config.Client.Video.enabled = false;
    }

    try {
      await ConfigDiagnostics.testMetaFileConfig(Config.Client.MetaFile, Config);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.warning('Meta file support error, switching off..', err.toString());
      Logger.warn(LOG_TAG, 'Meta file support error, switching off..', err.toString());
      Config.Client.MetaFile.enabled = false;
    }


    try {
      await ConfigDiagnostics.testImageFolder(Config.Server.imagesFolder);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.error('Images folder error', err.toString());
      Logger.error(LOG_TAG, 'Images folder error', err.toString());
    }
    try {
      await ConfigDiagnostics.testClientThumbnailConfig(Config.Client.Thumbnail);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.error('Thumbnail settings error', err.toString());
      Logger.error(LOG_TAG, 'Thumbnail settings error', err.toString());
    }


    try {
      await ConfigDiagnostics.testSearchConfig(Config.Client.Search, Config);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.warning('Search is not supported with these settings. Disabling temporally. ' +
        'Please adjust the config properly.', err.toString());
      Logger.warn(LOG_TAG, 'Search is not supported with these settings, switching off..', err.toString());
      Config.Client.Search.enabled = false;
    }

    try {
      await ConfigDiagnostics.testFacesConfig(Config.Client.Faces, Config);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.warning('Faces are not supported with these settings. Disabling temporally. ' +
        'Please adjust the config properly.', err.toString());
      Logger.warn(LOG_TAG, 'Faces are not supported with these settings, switching off..', err.toString());
      Config.Client.Faces.enabled = false;
    }

    try {
      await ConfigDiagnostics.testSharingConfig(Config.Client.Sharing, Config);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.warning('Sharing is not supported with these settings. Disabling temporally. ' +
        'Please adjust the config properly.', err.toString());
      Logger.warn(LOG_TAG, 'Sharing is not supported with these settings, switching off..', err.toString());
      Config.Client.Sharing.enabled = false;
    }

    try {
      await ConfigDiagnostics.testRandomPhotoConfig(Config.Client.Sharing, Config);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.warning('Random Media is not supported with these settings. Disabling temporally. ' +
        'Please adjust the config properly.', err.toString());
      Logger.warn(LOG_TAG, 'Random Media is not supported with these settings, switching off..', err.toString());
      Config.Client.Sharing.enabled = false;
    }


    try {
      await ConfigDiagnostics.testMapConfig(Config.Client.Map);
    } catch (ex) {
      const err: Error = ex;
      NotificationManager.warning('Maps is not supported with these settings. Using open street maps temporally. ' +
        'Please adjust the config properly.', err.toString());
      Logger.warn(LOG_TAG, 'Maps is not supported with these settings. Using open street maps temporally ' +
        'Please adjust the config properly.', err.toString());
      Config.Client.Map.mapProvider = ClientConfig.MapProviders.OpenStreetMap;
    }

  }
}
