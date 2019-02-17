import {Express, NextFunction, Request, Response} from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import {Utils} from '../../common/Utils';
import {Config} from '../../common/config/private/Config';
import {ProjectPath} from '../ProjectPath';
import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {CookieNames} from '../../common/CookieNames';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';

declare global {
  namespace Express {
    interface Request {
      locale?: string;
      localePath?: string;
      tpl?: any;
    }

    interface Response {
      tpl?: any;
    }
  }
}

export class PublicRouter {


  public static route(app: Express) {
    const setLocale = (req: Request, res: Response, next: Function) => {
      let localePath = '';
      let selectedLocale = req['locale'];
      if (req.cookies && req.cookies[CookieNames.lang]) {
        if (Config.Client.languages.indexOf(req.cookies[CookieNames.lang]) !== -1) {
          selectedLocale = req.cookies[CookieNames.lang];
        }
      }
      if (selectedLocale !== 'en') {
        localePath = selectedLocale;
      }
      res.cookie(CookieNames.lang, selectedLocale);
      req['localePath'] = localePath;
      next();
    };

    const renderIndex = (req: Request, res: Response, next: Function) => {
      ejs.renderFile(path.resolve(ProjectPath.FrontendFolder, req['localePath'], 'index.html'),
        res.tpl, (err, str) => {
          if (err) {
            return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, err.message));
          }
          res.send(str);
        });
    };


    const redirectToBase = (locale: string) => {
      return (req: Request, res: Response) => {
        if (Config.Client.languages.indexOf(locale) !== -1) {
          res.cookie(CookieNames.lang, locale);
        }
        res.redirect('/?ln=' + locale);
      };
    };

    app.use(
      (req: Request, res: Response, next: NextFunction) => {
        res.tpl = {};

        res.tpl.user = null;
        if (req.session.user) {
          const user = Utils.clone(req.session.user);
          delete user.password;
          res.tpl.user = user;
        }
        res.tpl.clientConfig = Config.Client;

        return next();
      });


      app.get(['/', '/login', '/gallery*', '/share*', '/admin', '/duplicates', '/faces', '/search*'],
      AuthenticationMWs.tryAuthenticate,
      setLocale,
      renderIndex
    );
    Config.Client.languages.forEach(l => {
      app.get(['/' + l + '/', '/' + l + '/login', '/' + l + '/gallery*', '/' + l + '/share*', '/' + l + '/admin', '/' + l + '/search*'],
        redirectToBase(l)
      );
    });

    app.get('/assets/:file(*)',
      setLocale,
      (req: Request, res: Response) => {
        const file = path.resolve(ProjectPath.FrontendFolder, req['localePath'], 'assets', req.params.file);
        fs.exists(file, (exists: boolean) => {
          if (!exists) {
            return res.sendStatus(404);
          }
          res.sendFile(file);
        });
      });
    app.get('/:file',
      setLocale,
      (req: Request, res: Response) => {
        const file = path.resolve(ProjectPath.FrontendFolder, req['localePath'], req.params.file);
        fs.exists(file, (exists: boolean) => {
          if (!exists) {
            return res.sendStatus(404);
          }
          res.sendFile(file);
        });
      });
  }

}
