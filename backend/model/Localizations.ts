import {ProjectPath} from '../ProjectPath';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from '../../common/config/private/Config';

export class Localizations {

  constructor() {
  }

  public static init() {
    const notLanguage = ['assets'];
    const dirCont = fs.readdirSync(ProjectPath.FrontendFolder)
      .filter(f => fs.statSync(path.join(ProjectPath.FrontendFolder, f)).isDirectory());
    Config.Client.languages = dirCont.filter(d => notLanguage.indexOf(d) === -1);
    Config.Client.languages.push('en');
  }

}
