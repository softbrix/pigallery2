import {IUserManager} from './interfaces/IUserManager';
import {IGalleryManager} from './interfaces/IGalleryManager';
import {ISearchManager} from './interfaces/ISearchManager';
import {SQLConnection} from './sql/SQLConnection';
import {ISharingManager} from './interfaces/ISharingManager';
import {Logger} from '../Logger';
import {IIndexingTaskManager} from './interfaces/IIndexingTaskManager';
import {IIndexingManager} from './interfaces/IIndexingManager';
import {IPersonManager} from './interfaces/IPersonManager';

export class ObjectManagerRepository {

  private static _instance: ObjectManagerRepository = null;

  private _galleryManager: IGalleryManager;
  private _userManager: IUserManager;
  private _searchManager: ISearchManager;
  private _sharingManager: ISharingManager;
  private _indexingManager: IIndexingManager;
  private _indexingTaskManager: IIndexingTaskManager;
  private _personManager: IPersonManager;

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
      this._instance = new ObjectManagerRepository();
    }
    return this._instance;
  }

  public static async reset() {
    await SQLConnection.close();
    this._instance = null;
  }

  public static async InitMemoryManagers() {
    await ObjectManagerRepository.reset();
    const GalleryManager = require('./memory/GalleryManager').GalleryManager;
    const UserManager = require('./memory/UserManager').UserManager;
    const SearchManager = require('./memory/SearchManager').SearchManager;
    const SharingManager = require('./memory/SharingManager').SharingManager;
    const IndexingTaskManager = require('./memory/IndexingTaskManager').IndexingTaskManager;
    const IndexingManager = require('./memory/IndexingManager').IndexingManager;
    const PersonManager = require('./memory/PersonManager').PersonManager;
    ObjectManagerRepository.getInstance().GalleryManager = new GalleryManager();
    ObjectManagerRepository.getInstance().UserManager = new UserManager();
    ObjectManagerRepository.getInstance().SearchManager = new SearchManager();
    ObjectManagerRepository.getInstance().SharingManager = new SharingManager();
    ObjectManagerRepository.getInstance().IndexingTaskManager = new IndexingTaskManager();
    ObjectManagerRepository.getInstance().IndexingManager = new IndexingManager();
    ObjectManagerRepository.getInstance().PersonManager = new PersonManager();
  }

  public static async InitSQLManagers() {
    await ObjectManagerRepository.reset();
    await SQLConnection.init();
    const GalleryManager = require('./sql/GalleryManager').GalleryManager;
    const UserManager = require('./sql/UserManager').UserManager;
    const SearchManager = require('./sql/SearchManager').SearchManager;
    const SharingManager = require('./sql/SharingManager').SharingManager;
    const IndexingTaskManager = require('./sql/IndexingTaskManager').IndexingTaskManager;
    const IndexingManager = require('./sql/IndexingManager').IndexingManager;
    const PersonManager = require('./sql/PersonManager').PersonManager;
    ObjectManagerRepository.getInstance().GalleryManager = new GalleryManager();
    ObjectManagerRepository.getInstance().UserManager = new UserManager();
    ObjectManagerRepository.getInstance().SearchManager = new SearchManager();
    ObjectManagerRepository.getInstance().SharingManager = new SharingManager();
    ObjectManagerRepository.getInstance().IndexingTaskManager = new IndexingTaskManager();
    ObjectManagerRepository.getInstance().IndexingManager = new IndexingManager();
    ObjectManagerRepository.getInstance().PersonManager = new PersonManager();
    Logger.debug('SQL DB inited');
  }

}
