import {expect} from 'chai';
import {SQLConnection} from '../../../../../backend/model/sql/SQLConnection';
import {PhotoEntity} from '../../../../../backend/model/sql/enitites/PhotoEntity';
import {SearchManager} from '../../../../../backend/model/sql/SearchManager';
import {AutoCompleteItem, SearchTypes} from '../../../../../common/entities/AutoCompleteItem';
import {SearchResultDTO} from '../../../../../common/entities/SearchResultDTO';
import {DirectoryEntity} from '../../../../../backend/model/sql/enitites/DirectoryEntity';
import {Utils} from '../../../../../common/Utils';
import {TestHelper} from './TestHelper';
import {VideoEntity} from '../../../../../backend/model/sql/enitites/VideoEntity';
import {PersonEntry} from '../../../../../backend/model/sql/enitites/PersonEntry';
import {FaceRegionEntry} from '../../../../../backend/model/sql/enitites/FaceRegionEntry';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {SQLTestHelper} from '../../../SQLTestHelper';
import {Config} from '../../../../../common/config/private/Config';

// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
describe = SQLTestHelper.describe;

describe('SearchManager', (sqlHelper: SQLTestHelper) => {

  const dir = TestHelper.getDirectoryEntry();
  const p = TestHelper.getPhotoEntry1(dir);
  const p2 = TestHelper.getPhotoEntry2(dir);
  const p_faceLess = TestHelper.getPhotoEntry2(dir);
  delete p_faceLess.metadata.faces;
  p_faceLess.name = 'fl';
  const v = TestHelper.getVideoEntry1(dir);

  const setUpSqlDB = async () => {
    await sqlHelper.initDB();

    const savePhoto = async (photo: PhotoDTO) => {
      const savedPhoto = await pr.save(photo);
      if (!photo.metadata.faces) {
        return;
      }
      for (let i = 0; i < photo.metadata.faces.length; i++) {
        const face = photo.metadata.faces[i];
        const person = await conn.getRepository(PersonEntry).save({name: face.name});
        await conn.getRepository(FaceRegionEntry).save({box: face.box, person: person, media: savedPhoto});
      }
    };
    const conn = await SQLConnection.getConnection();

    const pr = conn.getRepository(PhotoEntity);

    await conn.getRepository(DirectoryEntity).save(p.directory);
    await savePhoto(p);
    await savePhoto(p2);
    await savePhoto(p_faceLess);

    await conn.getRepository(VideoEntity).save(v);

    await SQLConnection.close();
  };


  beforeEach(async () => {
    await setUpSqlDB();
  });


  after(async () => {
    await sqlHelper.clearDB();
  });

  it('should get autocomplete', async () => {
    const sm = new SearchManager();

    const cmp = (a: AutoCompleteItem, b: AutoCompleteItem) => {
      if (a.text === b.text) {
        return a.type - b.type;
      }
      return a.text.localeCompare(b.text);
    };

    expect((await sm.autocomplete('tat'))).to.deep.equal([new AutoCompleteItem('Tatooine', SearchTypes.position)]);
    expect((await sm.autocomplete('star'))).to.deep.equal([new AutoCompleteItem('star wars', SearchTypes.keyword),
      new AutoCompleteItem('death star', SearchTypes.keyword)]);

    expect((await sm.autocomplete('wars'))).to.deep.equal([new AutoCompleteItem('star wars', SearchTypes.keyword),
      new AutoCompleteItem('wars dir', SearchTypes.directory)]);

    expect((await sm.autocomplete('arch'))).eql([new AutoCompleteItem('Research City', SearchTypes.position)]);

    Config.Client.Search.AutoComplete.maxItemsPerCategory = 99999;
    expect((await sm.autocomplete('a')).sort(cmp)).eql([
      new AutoCompleteItem('Boba Fett', SearchTypes.keyword),
      new AutoCompleteItem('Boba Fett', SearchTypes.person),
      new AutoCompleteItem('star wars', SearchTypes.keyword),
      new AutoCompleteItem('Anakin', SearchTypes.keyword),
      new AutoCompleteItem('Anakin Skywalker', SearchTypes.person),
      new AutoCompleteItem('Luke Skywalker', SearchTypes.person),
      new AutoCompleteItem('Han Solo', SearchTypes.person),
      new AutoCompleteItem('death star', SearchTypes.keyword),
      new AutoCompleteItem('Padmé Amidala', SearchTypes.person),
      new AutoCompleteItem('Obivan Kenobi', SearchTypes.person),
      new AutoCompleteItem('Padmé Amidala', SearchTypes.keyword),
      new AutoCompleteItem('Natalie Portman', SearchTypes.keyword),
      new AutoCompleteItem('Han Solo\'s dice', SearchTypes.photo),
      new AutoCompleteItem('Kamino', SearchTypes.position),
      new AutoCompleteItem('Tatooine', SearchTypes.position),
      new AutoCompleteItem('wars dir', SearchTypes.directory),
      new AutoCompleteItem('Research City', SearchTypes.position)].sort(cmp));

    Config.Client.Search.AutoComplete.maxItemsPerCategory = 1;
    expect((await sm.autocomplete('a')).sort(cmp)).eql([
      new AutoCompleteItem('Anakin', SearchTypes.keyword),
      new AutoCompleteItem('star wars', SearchTypes.keyword),
      new AutoCompleteItem('death star', SearchTypes.keyword),
      new AutoCompleteItem('Anakin Skywalker', SearchTypes.person),
      new AutoCompleteItem('Han Solo\'s dice', SearchTypes.photo),
      new AutoCompleteItem('Kamino', SearchTypes.position),
      new AutoCompleteItem('Research City', SearchTypes.position),
      new AutoCompleteItem('wars dir', SearchTypes.directory),
      new AutoCompleteItem('Boba Fett', SearchTypes.keyword)].sort(cmp));
    Config.Client.Search.AutoComplete.maxItemsPerCategory = 5;

    expect((await sm.autocomplete('sw')).sort(cmp)).to.deep.equal([new AutoCompleteItem('sw1', SearchTypes.photo),
      new AutoCompleteItem('sw2', SearchTypes.photo), new AutoCompleteItem(v.name, SearchTypes.video)].sort(cmp));

    expect((await sm.autocomplete(v.name)).sort(cmp)).to.deep.equal([new AutoCompleteItem(v.name, SearchTypes.video)]);

  });


  it('should search', async () => {
    const sm = new SearchManager();


    expect(Utils.clone(await sm.search('sw', null))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'sw',
      searchType: null,
      directories: [],
      media: [p, p2, v],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('Boba', null))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'Boba',
      searchType: null,
      directories: [],
      media: [p],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('Tatooine', SearchTypes.position))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'Tatooine',
      searchType: SearchTypes.position,
      directories: [],
      media: [p],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('ortm', SearchTypes.keyword))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'ortm',
      searchType: SearchTypes.keyword,
      directories: [],
      media: [p2, p_faceLess],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('ortm', SearchTypes.keyword))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'ortm',
      searchType: SearchTypes.keyword,
      directories: [],
      media: [p2, p_faceLess],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('wa', SearchTypes.keyword))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'wa',
      searchType: SearchTypes.keyword,
      directories: [dir],
      media: [p, p2, p_faceLess],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('han', SearchTypes.photo))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'han',
      searchType: SearchTypes.photo,
      directories: [],
      media: [p],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('sw', SearchTypes.video))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'sw',
      searchType: SearchTypes.video,
      directories: [],
      media: [v],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('han', SearchTypes.keyword))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'han',
      searchType: SearchTypes.keyword,
      directories: [],
      media: [],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('Boba', SearchTypes.person))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'Boba',
      searchType: SearchTypes.person,
      directories: [],
      media: [p],
      metaFile: [],
      resultOverflow: false
    }));
  });


  it('should instant search', async () => {
    const sm = new SearchManager();

    expect(Utils.clone(await sm.instantSearch('sw'))).to.deep.equal(Utils.clone({
      searchText: 'sw',
      directories: [],
      media: [p, p2, v],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.instantSearch('Tatooine'))).to.deep.equal(Utils.clone({
      searchText: 'Tatooine',
      directories: [],
      media: [p],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.instantSearch('ortm'))).to.deep.equal(Utils.clone({
      searchText: 'ortm',
      directories: [],
      media: [p2, p_faceLess],
      metaFile: [],
      resultOverflow: false
    }));


    expect(Utils.clone(await sm.instantSearch('wa'))).to.deep.equal(Utils.clone({
      searchText: 'wa',
      directories: [dir],
      media: [p, p2, p_faceLess],
      metaFile: [],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.instantSearch('han'))).to.deep.equal(Utils.clone({
      searchText: 'han',
      directories: [],
      media: [p],
      metaFile: [],
      resultOverflow: false
    }));
    expect(Utils.clone(await sm.instantSearch('Boba'))).to.deep.equal(Utils.clone({
      searchText: 'Boba',
      directories: [],
      media: [p],
      metaFile: [],
      resultOverflow: false
    }));
  });


});
