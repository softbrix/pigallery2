import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class VersionService {

  public version: BehaviorSubject<string>;

  constructor() {
    this.version = new BehaviorSubject<string>(null);
  }

  public onNewVersion(version: string) {
    if (this.version.value === version) {
      return;
    }
    this.version.next(version);
  }
}
