import {Injectable} from '@angular/core';
import {ShareService} from '../ui/gallery/share.service';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {QueryParams} from '../../../common/QueryParams';
import {Utils} from '../../../common/Utils';
import {GalleryService} from '../ui/gallery/gallery.service';
import {Config} from '../../../common/config/public/Config';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';

@Injectable()
export class QueryService {


  constructor(private shareService: ShareService,
              private galleryService: GalleryService) {
  }

  getMediaStringId(media: MediaDTO): string {
    if (this.galleryService.isSearchResult()) {
      return Utils.concatUrls(media.directory.path, media.directory.name, media.name);
    } else {
      return media.name;
    }
  }

  getParams(media?: MediaDTO): { [key: string]: string } {
    const query: { [key: string]: string } = {};
    if (media) {
      query[QueryParams.gallery.photo] = this.getMediaStringId(media);
    }
    if (Config.Client.Sharing.enabled === true) {
      if (this.shareService.isSharing()) {
        query[QueryParams.gallery.sharingKey_short] = this.shareService.getSharingKey();
      }
    }
    return query;
  }

  getParamsForDirs(directory: DirectoryDTO) {
    const params: { [key: string]: any } = {};
    if (Config.Client.Sharing.enabled === true) {
      if (this.shareService.isSharing()) {
        params[QueryParams.gallery.sharingKey_short] = this.shareService.getSharingKey();
      }
    }
    if (directory && directory.lastModified && directory.lastScanned &&
      !directory.isPartial) {
      params[QueryParams.gallery.knownLastModified] = directory.lastModified;
      params[QueryParams.gallery.knownLastScanned] = directory.lastScanned;
    }

    return params;

  }

}
