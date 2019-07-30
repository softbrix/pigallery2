import {NextFunction, Request, Response} from 'express';
import {CreateSharingDTO, SharingDTO} from '../../common/entities/SharingDTO';
import {ObjectManagers} from '../model/ObjectManagers';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {Config} from '../../common/config/private/Config';
import {QueryParams} from '../../common/QueryParams';

const LOG_TAG = '[SharingMWs]';

export class SharingMWs {


  private static generateKey(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4();
  }


  public static async getSharing(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.Sharing.enabled === false) {
      return next();
    }
    const sharingKey = req.params[QueryParams.gallery.sharingKey_long];

    try {
      req.resultPipe = await ObjectManagers.getInstance().SharingManager.findOne({sharingKey: sharingKey});
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during retrieving sharing link', err));
    }

  }

  public static async createSharing(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.Sharing.enabled === false) {
      return next();
    }
    if ((typeof req.body === 'undefined') || (typeof req.body.createSharing === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, 'createSharing filed is missing'));
    }
    const createSharing: CreateSharingDTO = req.body.createSharing;
    let sharingKey = SharingMWs.generateKey();

    // create one not yet used

    while (true) {
      try {
        await ObjectManagers.getInstance().SharingManager.findOne({sharingKey: sharingKey});
        sharingKey = this.generateKey();
      } catch (err) {
        break;
      }
    }


    const directoryName = req.params.directory || '/';
    const sharing: SharingDTO = {
      id: null,
      sharingKey: sharingKey,
      path: directoryName,
      password: createSharing.password,
      creator: req.session.user,
      expires: Date.now() + createSharing.valid,
      includeSubfolders: createSharing.includeSubfolders,
      timeStamp: Date.now()
    };

    try {

      req.resultPipe = await ObjectManagers.getInstance().SharingManager.createSharing(sharing);
      return next();

    } catch (err) {
      console.warn(err);
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during creating sharing link', err));
    }
  }

  public static async updateSharing(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.Sharing.enabled === false) {
      return next();
    }
    if ((typeof req.body === 'undefined') || (typeof req.body.updateSharing === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, 'updateSharing filed is missing'));
    }
    const updateSharing: CreateSharingDTO = req.body.updateSharing;
    const directoryName = req.params.directory || '/';
    const sharing: SharingDTO = {
      id: updateSharing.id,
      path: directoryName,
      sharingKey: '',
      password: (updateSharing.password && updateSharing.password !== '') ? updateSharing.password : null,
      creator: req.session.user,
      expires: Date.now() + updateSharing.valid,
      includeSubfolders: updateSharing.includeSubfolders,
      timeStamp: Date.now()
    };

    try {
      req.resultPipe = await ObjectManagers.getInstance().SharingManager.updateSharing(sharing);
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during updating sharing link', err));
    }

  }
}
