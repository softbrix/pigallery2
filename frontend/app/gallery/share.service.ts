import {Injectable} from '@angular/core';
import {NetworkService} from '../model/network/network.service';
import {CreateSharingDTO, SharingDTO} from '../../../common/entities/SharingDTO';
import {Router, RoutesRecognized} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {QueryParams} from '../../../common/QueryParams';
import {UserDTO} from '../../../common/entities/UserDTO';

@Injectable()
export class ShareService {

  public sharing: BehaviorSubject<SharingDTO>;
  param: string = null;
  queryParam: string = null;
  sharingKey: string = null;
  inited = false;
  public ReadyPR: Promise<void>;
  private resolve: () => void;


  constructor(private networkService: NetworkService,
              private router: Router) {
    this.sharing = new BehaviorSubject(null);
    this.ReadyPR = new Promise((resolve: () => void) => {
      if (this.inited === true) {
        return resolve();
      }
      this.resolve = resolve;
    });

    this.router.events.subscribe(val => {
      if (val instanceof RoutesRecognized) {
        this.param = val.state.root.firstChild.params[QueryParams.gallery.sharingKey_long] || null;
        this.queryParam = val.state.root.firstChild.queryParams[QueryParams.gallery.sharingKey_short] || null;

        const changed = this.sharingKey !== (this.param || this.queryParam);
        if (changed) {
          this.sharingKey = this.param || this.queryParam || this.sharingKey;
          this.getSharing();
        }
        if (this.resolve) {
          this.resolve();
          this.resolve = null;
          this.inited = true;
        }

      }
    });


  }

  public setUserObs(userOB: Observable<UserDTO>) {

    userOB.subscribe((user) => {
      console.log(user);
      if (user && !!user.usedSharingKey) {
        if (user.usedSharingKey !== this.sharingKey) {
          this.sharingKey = user.usedSharingKey;
          this.getSharing();
        }
        if (this.resolve) {
          this.resolve();
          this.resolve = null;
          this.inited = true;
        }
      }
    });
  }


  public wait(): Promise<void> {
    if (this.inited) {
      return Promise.resolve();
    }
    return this.ReadyPR;
  }

  public createSharing(dir: string, includeSubfolders: boolean, valid: number): Promise<SharingDTO> {
    return this.networkService.postJson('/share/' + dir, {
      createSharing: <CreateSharingDTO>{
        includeSubfolders: includeSubfolders,
        valid: valid
      }
    });
  }

  public updateSharing(dir: string, sharingId: number, includeSubfolders: boolean, password: string, valid: number): Promise<SharingDTO> {
    return this.networkService.putJson('/share/' + dir, {
      updateSharing: <CreateSharingDTO>{
        id: sharingId,
        includeSubfolders: includeSubfolders,
        valid: valid,
        password: password
      }
    });
  }

  public getSharingKey() {
    return this.sharingKey;
  }

  public isSharing(): boolean {
    return this.sharingKey != null;

  }

  public async getSharing(): Promise<SharingDTO> {
    const sharing = await this.networkService.getJson<SharingDTO>('/share/' + this.getSharingKey());
    this.sharing.next(sharing);
    return sharing;
  }
}
