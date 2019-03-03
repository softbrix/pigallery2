import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {Express} from 'express';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {UserRoles} from '../../common/entities/UserDTO';
import {PersonMWs} from '../middlewares/PersonMWs';
import {ThumbnailGeneratorMWs} from '../middlewares/thumbnail/ThumbnailGeneratorMWs';
import {VersionMWs} from '../middlewares/VersionMWs';

export class PersonRouter {
  public static route(app: Express) {

    this.addPersons(app);
    this.getPersonThumbnail(app);
  }

  private static addPersons(app: Express) {
    app.get(['/api/person'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      VersionMWs.injectGalleryVersion,

      // specific part
      PersonMWs.listPersons,
      PersonMWs.addSamplePhotoForAll,
      ThumbnailGeneratorMWs.addThumbnailInfoForPersons,
      PersonMWs.removeSamplePhotoForAll,
      RenderingMWs.renderResult
    );
  }

  private static getPersonThumbnail(app: Express) {
    app.get(['/api/person/:name/thumbnail'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      VersionMWs.injectGalleryVersion,

      // specific part
      PersonMWs.getSamplePhoto,
      ThumbnailGeneratorMWs.generatePersonThumbnail,
      RenderingMWs.renderFile
    );
  }

}
