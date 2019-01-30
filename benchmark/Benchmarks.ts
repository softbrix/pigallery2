import {SQLConnection} from '../backend/model/sql/SQLConnection';
import {Config} from '../common/config/private/Config';
import {DatabaseType, ReIndexingSensitivity} from '../common/config/private/IPrivateConfig';
import {ObjectManagerRepository} from '../backend/model/ObjectManagerRepository';
import {DiskMangerWorker} from '../backend/model/threading/DiskMangerWorker';
import {IndexingManager} from '../backend/model/sql/IndexingManager';
import {SearchManager} from '../backend/model/sql/SearchManager';
import * as fs from 'fs';
import {SearchTypes} from '../common/entities/AutoCompleteItem';
import {Utils} from '../common/Utils';
import {GalleryManager} from '../backend/model/sql/GalleryManager';
import {DirectoryDTO} from '../common/entities/DirectoryDTO';

export interface BenchmarkResult {
  duration: number;
  directories?: number;
  media?: number;
  items?: number;
}

export class BMIndexingManager extends IndexingManager {

  public async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}

export class Benchmarks {

  constructor(public RUNS: number, public dbPath: string) {

  }

  async bmSaveDirectory(): Promise<BenchmarkResult> {
    await this.resetDB();
    const dir = await DiskMangerWorker.scanDirectory('./');
    const im = new BMIndexingManager();
    return await this.benchmark(() => im.saveToDB(dir), () => this.resetDB());
  }

  async bmScanDirectory(): Promise<BenchmarkResult> {
    return await this.benchmark(() => DiskMangerWorker.scanDirectory('./'));
  }

  async bmListDirectory(): Promise<BenchmarkResult> {
    const gm = new GalleryManager();
    await this.setupDB();
    Config.Server.indexing.reIndexingSensitivity = ReIndexingSensitivity.low;
    return await this.benchmark(() => gm.listDirectory('./'));
  }

  async bmAllSearch(text: string): Promise<{ result: BenchmarkResult, searchType: SearchTypes }[]> {
    await this.setupDB();
    const types = Utils.enumToArray(SearchTypes).map(a => a.key).concat([null]);
    const results: { result: BenchmarkResult, searchType: SearchTypes }[] = [];
    const sm = new SearchManager();
    for (let i = 0; i < types.length; i++) {
      results.push({result: await this.benchmark(() => sm.search(text, types[i])), searchType: types[i]});
    }
    return results;
  }

  async bmInstantSearch(text: string): Promise<BenchmarkResult> {
    await this.setupDB();
    const sm = new SearchManager();
    return await this.benchmark(() => sm.instantSearch(text));
  }

  async bmAutocomplete(text: string): Promise<BenchmarkResult> {
    await this.setupDB();
    const sm = new SearchManager();
    return await this.benchmark(() => sm.autocomplete(text));
  }


  private async benchmark(fn: () => Promise<{ media: any[], directories: any[] } | any[] | void>,
                          beforeEach: () => Promise<any> = null,
                          afterEach: () => Promise<any> = null) {
    const scanned = await fn();
    const start = process.hrtime();
    let skip = 0;
    for (let i = 0; i < this.RUNS; i++) {
      if (beforeEach) {
        const startSkip = process.hrtime();
        await beforeEach();
        const endSkip = process.hrtime(startSkip);
        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
      }
      await fn();
      if (afterEach) {
        const startSkip = process.hrtime();
        await afterEach();
        const endSkip = process.hrtime(startSkip);
        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
      }
    }
    const end = process.hrtime(start);
    const duration = (end[0] * 1000 + end[1] / 1000000) / this.RUNS;

    if (!scanned) {
      return {
        duration: duration
      };
    }

    if (Array.isArray(scanned)) {
      return {
        duration: duration,
        items: scanned.length
      };
    }

    return {
      duration: duration,
      media: scanned.media.length,
      directories: scanned.directories.length
    };
  }

  private resetDB = async () => {
    await SQLConnection.close();
    if (fs.existsSync(this.dbPath)) {
      fs.unlinkSync(this.dbPath);
    }
    Config.Server.database.type = DatabaseType.sqlite;
    Config.Server.database.sqlite.storage = this.dbPath;
    await ObjectManagerRepository.InitSQLManagers();
  };

  private async setupDB() {
    const im = new BMIndexingManager();
    await this.resetDB();
    const dir = await DiskMangerWorker.scanDirectory('./');
    await im.saveToDB(dir);
  }

}
