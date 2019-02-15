import {NextFunction, Request, Response} from 'express';
import {ObjectManagers} from '../model/ObjectManagers';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {CostumHeaders} from '../../common/CostumHeaders';


const LOG_TAG = '[VersionMWs]';

export class VersionMWs {


  /**
   * This version data is mainly used on the client side to invalidate the cache
   * @param req
   * @param res
   * @param next
   */
  public static async injectGalleryVersion(req: Request, res: Response, next: NextFunction) {
    try {
      res.header(CostumHeaders.dataVersion, await ObjectManagers.getInstance().VersionManager.getDataVersion());
      next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Can not get data version', err.toString()));
    }
  }

}
