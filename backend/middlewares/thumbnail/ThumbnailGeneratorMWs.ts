import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../../common/entities/Error';
import {ContentWrapper} from '../../../common/entities/ConentWrapper';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ThumbnailProcessingLib} from '../../../common/config/private/IPrivateConfig';
import {ThumbnailTH} from '../../model/threading/ThreadPool';
import {RendererInput, ThumbnailSourceType, ThumbnailWorker} from '../../model/threading/ThumbnailWorker';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {ITaskExecuter, TaskExecuter} from '../../model/threading/TaskExecuter';
import {FaceRegion, PhotoDTO} from '../../../common/entities/PhotoDTO';
import {PersonWithPhoto} from '../PersonMWs';


export class ThumbnailGeneratorMWs {
  private static initDone = false;
  private static taskQue: ITaskExecuter<RendererInput, void> = null;

  public static init() {
    if (this.initDone === true) {
      return;
    }


    if (Config.Server.threading.enable === true) {
      if (Config.Server.threading.thumbnailThreads > 0) {
        Config.Client.Thumbnail.concurrentThumbnailGenerations = Config.Server.threading.thumbnailThreads;
      } else {
        Config.Client.Thumbnail.concurrentThumbnailGenerations = Math.max(1, os.cpus().length - 1);
      }
    } else {
      Config.Client.Thumbnail.concurrentThumbnailGenerations = 1;
    }

    if (Config.Server.threading.enable === true &&
      Config.Server.thumbnail.processingLibrary === ThumbnailProcessingLib.Jimp) {
      this.taskQue = new ThumbnailTH(Config.Client.Thumbnail.concurrentThumbnailGenerations);
    } else {
      this.taskQue = new TaskExecuter(Config.Client.Thumbnail.concurrentThumbnailGenerations,
        (input => ThumbnailWorker.render(input, Config.Server.thumbnail.processingLibrary)));
    }

    this.initDone = true;
  }

  public static addThumbnailInformation(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }

    try {
      const cw: ContentWrapper = req.resultPipe;
      if (cw.notModified === true) {
        return next();
      }
      if (cw.directory) {
        ThumbnailGeneratorMWs.addThInfoTODir(cw.directory);
      }
      if (cw.searchResult && cw.searchResult.media) {
        ThumbnailGeneratorMWs.addThInfoToPhotos(cw.searchResult.media);
      }

    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.SERVER_ERROR, 'error during postprocessing result (adding thumbnail info)', error.toString()));

    }

    return next();

  }


  public static addThumbnailInfoForPersons(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }

    try {
      const size: number = Config.Client.Thumbnail.personThumbnailSize;

      const persons: PersonWithPhoto[] = req.resultPipe;
      for (let i = 0; i < persons.length; i++) {

        // load parameters
        const mediaPath = path.join(ProjectPath.ImageFolder,
          persons[i].samplePhoto.directory.path,
          persons[i].samplePhoto.directory.name, persons[i].samplePhoto.name);

        // generate thumbnail path
        const thPath = path.join(ProjectPath.ThumbnailFolder,
          ThumbnailGeneratorMWs.generatePersonThumbnailName(mediaPath, persons[i].samplePhoto.metadata.faces[0], size));

        persons[i].readyThumbnail = fs.existsSync(thPath);
      }

    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.SERVER_ERROR, 'error during postprocessing result (adding thumbnail info)', error.toString()));

    }

    return next();

  }

  public static async generatePersonThumbnail(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }
    // load parameters
    const photo: PhotoDTO = req.resultPipe;
    if (!photo.metadata.faces || photo.metadata.faces.length !== 1) {
      return next(new ErrorDTO(ErrorCodes.THUMBNAIL_GENERATION_ERROR, 'Photo does not contain  a face'));
    }

    // load parameters
    const mediaPath = path.join(ProjectPath.ImageFolder, photo.directory.path, photo.directory.name, photo.name);
    const size: number = Config.Client.Thumbnail.personThumbnailSize;
    // generate thumbnail path
    const thPath = path.join(ProjectPath.ThumbnailFolder,
      ThumbnailGeneratorMWs.generatePersonThumbnailName(mediaPath, photo.metadata.faces[0], size));


    req.resultPipe = thPath;

    // check if thumbnail already exist
    if (fs.existsSync(thPath) === true) {
      return next();
    }

    // create thumbnail folder if not exist
    if (!fs.existsSync(ProjectPath.ThumbnailFolder)) {
      fs.mkdirSync(ProjectPath.ThumbnailFolder);
    }

    const margin = {
      x: Math.round(photo.metadata.faces[0].box.width * (Config.Server.thumbnail.personFaceMargin)),
      y: Math.round(photo.metadata.faces[0].box.height * (Config.Server.thumbnail.personFaceMargin))
    };
    // run on other thread
    const input = <RendererInput>{
      type: ThumbnailSourceType.Image,
      mediaPath: mediaPath,
      size: size,
      thPath: thPath,
      makeSquare: false,
      cut: {
        x: Math.round(Math.max(0, photo.metadata.faces[0].box.x - margin.x / 2)),
        y: Math.round(Math.max(0, photo.metadata.faces[0].box.y - margin.y / 2)),
        width: photo.metadata.faces[0].box.width + margin.x,
        height: photo.metadata.faces[0].box.height + margin.y
      },
      qualityPriority: Config.Server.thumbnail.qualityPriority
    };
    try {
      await ThumbnailGeneratorMWs.taskQue.execute(input);
      return next();
    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.THUMBNAIL_GENERATION_ERROR,
        'Error during generating face thumbnail: ' + input.mediaPath, error.toString()));
    }

  }

  public static generateThumbnailFactory(sourceType: ThumbnailSourceType) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.resultPipe) {
        return next();
      }

      // load parameters
      const mediaPath = req.resultPipe;
      let size: number = parseInt(req.params.size, 10) || Config.Client.Thumbnail.thumbnailSizes[0];

      // validate size
      if (Config.Client.Thumbnail.thumbnailSizes.indexOf(size) === -1) {
        size = Config.Client.Thumbnail.thumbnailSizes[0];
      }

      ThumbnailGeneratorMWs.generateImage(mediaPath, size, sourceType, false, req, res, next);
    };
  }

  public static generateIconFactory(sourceType: ThumbnailSourceType) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.resultPipe) {
        return next();
      }

      // load parameters
      const mediaPath = req.resultPipe;
      const size: number = Config.Client.Thumbnail.iconSize;
      ThumbnailGeneratorMWs.generateImage(mediaPath, size, sourceType, true, req, res, next);

    };
  }

  public static generateThumbnailName(mediaPath: string, size: number): string {
    return crypto.createHash('md5').update(mediaPath).digest('hex') + '_' + size + '.jpg';
  }

  public static generatePersonThumbnailName(mediaPath: string, faceRegion: FaceRegion, size: number): string {
    return crypto.createHash('md5').update(mediaPath + '_' + faceRegion.name + '_' + faceRegion.box.x + '_' + faceRegion.box.y)
      .digest('hex') + '_' + size + '.jpg';
  }

  private static addThInfoTODir(directory: DirectoryDTO) {
    if (typeof directory.media !== 'undefined') {
      ThumbnailGeneratorMWs.addThInfoToPhotos(directory.media);
    }
    if (typeof directory.directories !== 'undefined') {
      for (let i = 0; i < directory.directories.length; i++) {
        ThumbnailGeneratorMWs.addThInfoTODir(directory.directories[i]);
      }
    }
  }

  private static addThInfoToPhotos(photos: MediaDTO[]) {
    const thumbnailFolder = ProjectPath.ThumbnailFolder;
    for (let i = 0; i < photos.length; i++) {
      const fullMediaPath = path.join(ProjectPath.ImageFolder, photos[i].directory.path, photos[i].directory.name, photos[i].name);
      for (let j = 0; j < Config.Client.Thumbnail.thumbnailSizes.length; j++) {
        const size = Config.Client.Thumbnail.thumbnailSizes[j];
        const thPath = path.join(thumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(fullMediaPath, size));
        if (fs.existsSync(thPath) === true) {
          if (typeof photos[i].readyThumbnails === 'undefined') {
            photos[i].readyThumbnails = [];
          }
          photos[i].readyThumbnails.push(size);
        }
      }
      const iconPath = path.join(thumbnailFolder,
        ThumbnailGeneratorMWs.generateThumbnailName(fullMediaPath, Config.Client.Thumbnail.iconSize));
      if (fs.existsSync(iconPath) === true) {
        photos[i].readyIcon = true;
      }
    }
  }

  private static async generateImage(mediaPath: string,
                                     size: number,
                                     sourceType: ThumbnailSourceType,
                                     makeSquare: boolean,
                                     req: Request, res: Response, next: NextFunction) {
    // generate thumbnail path
    const thPath = path.join(ProjectPath.ThumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(mediaPath, size));


    req.resultPipe = thPath;

    // check if thumbnail already exist
    if (fs.existsSync(thPath) === true) {
      return next();
    }

    // create thumbnail folder if not exist
    if (!fs.existsSync(ProjectPath.ThumbnailFolder)) {
      fs.mkdirSync(ProjectPath.ThumbnailFolder);
    }

    // run on other thread
    const input = <RendererInput>{
      type: sourceType,
      mediaPath: mediaPath,
      size: size,
      thPath: thPath,
      makeSquare: makeSquare,
      qualityPriority: Config.Server.thumbnail.qualityPriority
    };
    try {
      await this.taskQue.execute(input);
      return next();
    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.THUMBNAIL_GENERATION_ERROR,
        'Error during generating thumbnail: ' + input.mediaPath, error.toString()));
    }
  }
}

