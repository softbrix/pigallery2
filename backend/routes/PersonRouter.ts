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
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      VersionMWs.injectGalleryVersion,
      PersonMWs.listPersons,
      RenderingMWs.renderResult
    );
  }

  private static getPersonThumbnail(app: Express) {
    app.get(['/api/person/:name/thumbnail'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      VersionMWs.injectGalleryVersion,
      PersonMWs.getSamplePhoto,
      ThumbnailGeneratorMWs.generatePersonThumbnail,
      RenderingMWs.renderFile
    );
  }

}
