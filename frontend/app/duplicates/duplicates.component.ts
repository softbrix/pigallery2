import {Component, HostListener, OnDestroy} from '@angular/core';
import {DuplicateService} from './duplicates.service';
import {Utils} from '../../../common/Utils';
import {QueryService} from '../model/query.service';
import {DuplicatesDTO} from '../../../common/entities/DuplicatesDTO';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {Subscription} from 'rxjs';
import {Config} from '../../../common/config/public/Config';
import {PageHelper} from '../model/page.helper';

interface GroupedDuplicate {
  name: string;
  duplicates: DuplicatesDTO[];
}

@Component({
  selector: 'app-duplicate',
  templateUrl: './duplicates.component.html',
  styleUrls: ['./duplicates.component.css']
})
export class DuplicateComponent implements OnDestroy {

  directoryGroups: GroupedDuplicate[] = null;
  renderedDirGroups: GroupedDuplicate[] = null;
  renderedIndex = {
    group: -1,
    pairs: 0
  };
  subscription: Subscription;
  renderTimer: number = null;
  duplicateCount = {
    pairs: 0,
    photos: 0
  };

  constructor(public _duplicateService: DuplicateService,
              public queryService: QueryService) {
    this._duplicateService.getDuplicates().catch(console.error);
    this.subscription = this._duplicateService.duplicates.subscribe((duplicates: DuplicatesDTO[]) => {
      this.directoryGroups = [];
      this.renderedIndex = {group: -1, pairs: 0};
      this.renderedDirGroups = [];
      this.duplicateCount = {
        pairs: 0,
        photos: 0
      };
      if (duplicates === null) {
        return;
      }
      this.duplicateCount.photos = duplicates.reduce((prev: number, curr) => prev + curr.media.length, 0);
      this.duplicateCount.pairs = duplicates.length;

      const getMostFrequentDir = (dupls: DuplicatesDTO[]) => {
        if (dupls.length === 0) {
          return null;
        }
        const dirFrequency: { [key: number]: { count: number, dir: DirectoryDTO } } = {};
        dupls.forEach(d => d.media.forEach(m => {
          dirFrequency[m.directory.id] = dirFrequency[m.directory.id] || {dir: m.directory, count: 0};
          dirFrequency[m.directory.id].count++;
        }));
        let max: { count: number, dir: DirectoryDTO } = {count: -1, dir: null};
        for (const freq of Object.values(dirFrequency)) {
          if (max.count <= freq.count) {
            max = freq;
          }
        }
        return max.dir;
      };

      while (duplicates.length > 0) {
        const dir = getMostFrequentDir(duplicates);
        const group = duplicates.filter(d => d.media.find(m => m.directory.id === dir.id));
        duplicates = duplicates.filter(d => !d.media.find(m => m.directory.id === dir.id));
        this.directoryGroups.push({name: this.getDirectoryPath(dir) + ' (' + group.length + ')', duplicates: group});
      }
      this.renderMore();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  getDirectoryPath(directory: DirectoryDTO) {
    return Utils.concatUrls(directory.path, directory.name);
  }

  renderMore = () => {
    if (this.renderTimer !== null) {
      clearTimeout(this.renderTimer);
      this.renderTimer = null;
    }

    if (this.directoryGroups.length === 0) {
      return;
    }

    if (this.renderedIndex.group === this.directoryGroups.length - 1 &&
      this.renderedIndex.pairs >=
      this.directoryGroups[this.renderedIndex.group].duplicates.length) {
      return;
    }
    if (this.shouldRenderMore()) {
      if (this.renderedDirGroups.length === 0 ||
        this.renderedIndex.pairs >=
        this.directoryGroups[this.renderedIndex.group].duplicates.length) {
        this.renderedDirGroups.push({
          name: this.directoryGroups[++this.renderedIndex.group].name,
          duplicates: []
        });
        this.renderedIndex.pairs = 0;
      }
      this.renderedDirGroups[this.renderedDirGroups.length - 1].duplicates
        .push(this.directoryGroups[this.renderedIndex.group].duplicates[this.renderedIndex.pairs++]);

      this.renderTimer = window.setTimeout(this.renderMore, 0);
    }
  };


  @HostListener('window:scroll')
  onScroll() {
    this.renderMore();
  }

  private shouldRenderMore(): boolean {
    return Config.Client.Other.enableOnScrollRendering === false ||
      PageHelper.ScrollY >= PageHelper.MaxScrollY * 0.7
      || (document.body.clientHeight) * 0.85 < window.innerHeight;
  }
}

