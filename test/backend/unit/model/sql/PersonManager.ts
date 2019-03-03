import {expect} from 'chai';
import {PersonManager} from '../../../../../backend/model/sql/PersonManager';
import {FaceRegion, PhotoDTO} from '../../../../../common/entities/PhotoDTO';


// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
declare const it: any;


describe('PersonManager', () => {

  it('should upgrade keywords to person', async () => {
    const pm = new PersonManager();
    pm.loadAll = () => Promise.resolve();
    pm.persons = [{name: 'Han Solo', id: 0, faces: [], count: 0, isFavourite: false},
      {name: 'Anakin', id: 2, faces: [], count: 0, isFavourite: false}];

    const p_noFaces = <PhotoDTO>{
      metadata: {
        keywords: ['Han Solo', 'just a keyword']
      }
    };

    const p_wFace = <PhotoDTO>{
      metadata: {
        keywords: ['Han Solo', 'Anakin'],
        faces: [{name: 'Obivan'}]
      }
    };

    const cmp = (a: FaceRegion, b: FaceRegion) => {
      return a.name.localeCompare(b.name);
    };

    await pm.keywordsToPerson([p_noFaces]);
    expect(p_noFaces.metadata.keywords).to.be.deep.equal(['just a keyword']);
    expect(p_noFaces.metadata.faces.sort(cmp)).to.eql([{name: 'Han Solo'}].sort(cmp));

    await pm.keywordsToPerson([p_wFace]);
    expect(p_wFace.metadata.keywords).to.be.deep.equal([]);
    expect(p_wFace.metadata.faces.sort(cmp)).to.be
      .eql([{name: 'Han Solo'}, {name: 'Obivan'}, {name: 'Anakin'}].sort(cmp));

  });

});
