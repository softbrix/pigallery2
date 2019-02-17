import {expect} from 'chai';
import {DiskMangerWorker} from '../../../../../backend/model/threading/DiskMangerWorker';
import * as path from 'path';
import {Config} from '../../../../../common/config/private/Config';
import {ProjectPath} from '../../../../../backend/ProjectPath';
import {Utils} from '../../../../../common/Utils';

describe('DiskMangerWorker', () => {

  it('should parse metadata', async () => {
    Config.Server.imagesFolder = path.join(__dirname, '/../../assets');
    ProjectPath.ImageFolder = path.join(__dirname, '/../../assets');
    const dir = await DiskMangerWorker.scanDirectory('/');
    expect(dir.media.length).to.be.equals(4);
    const expected = require(path.join(__dirname, '/../../assets/test image öüóőúéáű-.,.json'));
    expect(Utils.clone(dir.media[1].name)).to.be.deep.equal('test image öüóőúéáű-.,.jpg');
    expect(Utils.clone(dir.media[1].metadata)).to.be.deep.equal(expected);
  });

});
