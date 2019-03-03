import {Injectable} from '@angular/core';
import {Event} from '../../../../common/event/Event';

declare const document: {
  fullscreenElement: any;
  mozFullScreenElement: any;
  webkitFullscreenElement: any;
  exitFullscreen: () => void;
  mozCancelFullScreen: () => void;
  webkitExitFullscreen: () => void;
};

@Injectable()
export class FullScreenService {


  OnFullScreenChange = new Event<boolean>();

  public isFullScreenEnabled(): boolean {
    return !!(document['fullscreenElement'] ||
      document['mozFullScreenElement'] ||
      document['webkitFullscreenElement']);
  }

  public showFullScreen(element: Element) {
    if (this.isFullScreenEnabled()) {
      return;
    }

    if (element.requestFullscreen) {
      element.requestFullscreen().catch(console.error);
    } else if ((<any>element).mozRequestFullScreen) {
      (<any>element).mozRequestFullScreen();
    } else if ((<any>element).webkitRequestFullscreen) {
      (<any>element).webkitRequestFullscreen();
    } else if ((<any>element).msRequestFullscreen) {
      (<any>element).msRequestFullscreen();
    }
    this.OnFullScreenChange.trigger(true);
  }

  public exitFullScreen() {
    if (!this.isFullScreenEnabled()) {
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document['mozCancelFullScreen']) {
      document['mozCancelFullScreen']();
    } else if (document['webkitExitFullscreen']) {
      document['webkitExitFullscreen']();
    }
    this.OnFullScreenChange.trigger(false);
  }

}
