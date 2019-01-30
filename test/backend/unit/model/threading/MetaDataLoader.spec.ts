import {expect} from 'chai';
import {MetadataLoader} from '../../../../../backend/model/threading/MetadataLoader';
import {Utils} from '../../../../../common/Utils';
import * as path from 'path';

describe('MetadataLoader', () => {

  it('should load png', async () => {
    const data = await MetadataLoader.loadPhotoMetadata(path.join(__dirname, '/../../assets/test_png.png'));
    delete data.creationDate; // creation time for png not supported
    expect(Utils.clone(data)).to.be.deep.equal(Utils.clone({
      fileSize: 2155,
      orientation: 1,
      size: {
        height: 26,
        width: 26
      }
    }));
  });

  it('should load jpg', async () => {
    const data = await MetadataLoader.loadPhotoMetadata(path.join(__dirname, '/../../assets/test image öüóőúéáű-.,.jpg'));
    const expected = require(path.join(__dirname, '/../../assets/test image öüóőúéáű-.,.json'));
    expect(Utils.clone(data)).to.be.deep.equal(expected);
  });


  it('should load jpg 2', async () => {
    const data = await MetadataLoader.loadPhotoMetadata(path.join(__dirname, '/../../assets/old_photo.jpg'));
    const expected = require(path.join(__dirname, '/../../assets/old_photo.json'));
    expect(Utils.clone(data)).to.be.deep.equal(expected);
  });

});
