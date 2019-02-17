import {IUserManager} from './interfaces/IUserManager';
import {IGalleryManager} from './interfaces/IGalleryManager';
import {ISearchManager} from './interfaces/ISearchManager';
import {SQLConnection} from './sql/SQLConnection';
import {ISharingManager} from './interfaces/ISharingManager';
import {Logger} from '../Logger';
import {IIndexingTaskManager} from './interfaces/IIndexingTaskManager';
import {IIndexingManager} from './interfaces/IIndexingManager';
import {IPersonManager} from './interfaces/IPersonManager';
import {IVersionManager} from './interfaces/IVersionManager';

export class ObjectManagers {

  private static _instance: ObjectManagers = null;

  private _galleryManager: IGalleryManager;
  private _userManager: IUserManager;
  private _searchManager: ISearchManager;
  private _sharingManager: ISharingManager;
  private _indexingManager: IIndexingManager;
  private _indexingTaskManager: IIndexingTaskManager;
  private _personManager: IPersonManager;
  private _versionManager: IVersionManager;



  get VersionManager(): IVersionManager {
    return this._versionManager;
  }

  set VersionManager(value: IVersionManager) {
    this._versionManager = value;
  }

  get PersonManager(): IPersonManager {
    return this._personManager;
  }

  set PersonManager(value: IPersonManager) {
    this._personManager = value;
  }

  get IndexingManager(): IIndexingManager {
    return this._indexingManager;
  }

  set IndexingManager(value: IIndexingManager) {
    this._indexingManager = value;
  }

  get IndexingTaskManager(): IIndexingTaskManager {
    return this._indexingTaskManager;
  }

  set IndexingTaskManager(value: IIndexingTaskManager) {
    this._indexingTaskManager = value;
  }

  get GalleryManager(): IGalleryManager {
    return this._galleryManager;
  }

  set GalleryManager(value: IGalleryManager) {
    this._galleryManager = value;
  }

  get UserManager(): IUserManager {
    return this._userManager;
  }

  set UserManager(value: IUserManager) {
    this._userManager = value;
  }

  get SearchManager(): ISearchManager {
    return this._searchManager;
  }

  set SearchManager(value: ISearchManager) {
    this._searchManager = value;
  }

  get SharingManager(): ISharingManager {
    return this._sharingManager;
  }

  set SharingManager(value: ISharingManager) {
    this._sharingManager = value;
  }

  public static getInstance() {
    if (this._instance === null) {
      this._instance = new ObjectManagers();
    }
    return this._instance;
  }

  public static async reset() {
    await SQLConnection.close();
    this._instance = null;
  }

  public static async InitMemoryManagers() {
    await ObjectManagers.reset();
    const GalleryManager = require('./memory/GalleryManager').GalleryManager;
    const UserManager = require('./memory/UserManager').UserManager;
    const SearchManager = require('./memory/SearchManager').SearchManager;
    const SharingManager = require('./memory/SharingManager').SharingManager;
    const IndexingTaskManager = require('./memory/IndexingTaskManager').IndexingTaskManager;
    const IndexingManager = require('./memory/IndexingManager').IndexingManager;
    const PersonManager = require('./memory/PersonManager').PersonManager;
    const VersionManager = require('./memory/VersionManager').VersionManager;
    ObjectManagers.getInstance().GalleryManager = new GalleryManager();
    ObjectManagers.getInstance().UserManager = new UserManager();
    ObjectManagers.getInstance().SearchManager = new SearchManager();
    ObjectManagers.getInstance().SharingManager = new SharingManager();
    ObjectManagers.getInstance().IndexingTaskManager = new IndexingTaskManager();
    ObjectManagers.getInstance().IndexingManager = new IndexingManager();
    ObjectManagers.getInstance().PersonManager = new PersonManager();
    ObjectManagers.getInstance().VersionManager = new VersionManager();
  }

  public static async InitSQLManagers() {
    await ObjectManagers.reset();
    await SQLConnection.init();
    const GalleryManager = require('./sql/GalleryManager').GalleryManager;
    const UserManager = require('./sql/UserManager').UserManager;
    const SearchManager = require('./sql/SearchManager').SearchManager;
    const SharingManager = require('./sql/SharingManager').SharingManager;
    const IndexingTaskManager = require('./sql/IndexingTaskManager').IndexingTaskManager;
    const IndexingManager = require('./sql/IndexingManager').IndexingManager;
    const PersonManager = require('./sql/PersonManager').PersonManager;
    const VersionManager = require('./sql/VersionManager').VersionManager;
    ObjectManagers.getInstance().GalleryManager = new GalleryManager();
    ObjectManagers.getInstance().UserManager = new UserManager();
    ObjectManagers.getInstance().SearchManager = new SearchManager();
    ObjectManagers.getInstance().SharingManager = new SharingManager();
    ObjectManagers.getInstance().IndexingTaskManager = new IndexingTaskManager();
    ObjectManagers.getInstance().IndexingManager = new IndexingManager();
    ObjectManagers.getInstance().PersonManager = new PersonManager();
    ObjectManagers.getInstance().VersionManager = new VersionManager();
    Logger.debug('SQL DB inited');
  }

}
