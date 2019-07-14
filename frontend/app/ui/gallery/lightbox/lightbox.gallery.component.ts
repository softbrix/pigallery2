import {ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild} from '@angular/core';
import {GalleryPhotoComponent} from '../grid/photo/photo.grid.gallery.component';
import {Dimension} from '../../../model/IRenderable';
import {FullScreenService} from '../fullscreen.service';
import {OverlayService} from '../overlay.service';
import {animate, AnimationBuilder, AnimationPlayer, style} from '@angular/animations';
import {GalleryLightboxMediaComponent} from './media/media.lightbox.gallery.component';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PageHelper} from '../../../model/page.helper';
import {QueryService} from '../../../model/query.service';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';
import {QueryParams} from '../../../../../common/QueryParams';
import {GalleryService} from '../gallery.service';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {ControlsLightboxComponent} from './controls/controls.lightbox.gallery.component';

export enum LightboxStates {
  Open = 1,
  Closing = 2,
  Closed = 3
}

@Component({
  selector: 'app-gallery-lightbox',
  styleUrls: ['./lightbox.gallery.component.css'],
  templateUrl: './lightbox.gallery.component.html'
})
export class GalleryLightboxComponent implements OnDestroy, OnInit {

  @ViewChild('photo') mediaElement: GalleryLightboxMediaComponent;
  @ViewChild('controls') controls: ControlsLightboxComponent;
  @ViewChild('lightbox') lightboxElement: ElementRef;
  @ViewChild('root') root: ElementRef;

  public navigation = {hasPrev: true, hasNext: true};
  public blackCanvasOpacity = 0;
  public activePhoto: GalleryPhotoComponent;
  public status: LightboxStates = LightboxStates.Closed;
  public infoPanelVisible = false;
  public infoPanelWidth = 0;
  public animating = false;
  startPhotoDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  iPvisibilityTimer: number = null;
  visibilityTimer: number = null;
  delayedMediaShow: string = null;
  public photoFrameDim = {width: 1, height: 1, aspect: 1};
  private activePhotoId: number = null;
  private gridPhotoQL: QueryList<GalleryPhotoComponent>;
  private subscription: {
    photosChange: Subscription,
    route: Subscription
  } = {
    photosChange: null,
    route: null
  };


  constructor(public fullScreenService: FullScreenService,
              private changeDetector: ChangeDetectorRef,
              private overlayService: OverlayService,
              private _builder: AnimationBuilder,
              private router: Router,
              private queryService: QueryService,
              private galleryService: GalleryService,
              private route: ActivatedRoute) {
  }


  get Title(): string {
    if (!this.activePhoto) {
      return null;
    }
    return (<PhotoDTO>this.activePhoto.gridPhoto.media).metadata.caption;
  }

  public toggleFullscreen(): void {
    if (this.fullScreenService.isFullScreenEnabled()) {
      this.fullScreenService.exitFullScreen();
    } else {
      this.fullScreenService.showFullScreen(this.root.nativeElement);
    }
  }

  ngOnInit(): void {
    this.updatePhotoFrameDim();
    this.subscription.route = this.route.queryParams.subscribe((params: Params) => {
      if (params[QueryParams.gallery.photo] && params[QueryParams.gallery.photo] !== '') {
        if (!this.gridPhotoQL) {
          return this.delayedMediaShow = params[QueryParams.gallery.photo];
        }
        this.onNavigateTo(params[QueryParams.gallery.photo]);
      } else if (this.status === LightboxStates.Open) {
        this.delayedMediaShow = null;
        this.hideLightbox();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.controls) {
      this.controls.pause();
    }
    if (this.subscription.photosChange != null) {
      this.subscription.photosChange.unsubscribe();
    }
    if (this.subscription.route != null) {
      this.subscription.route.unsubscribe();
    }

    if (this.visibilityTimer != null) {
      clearTimeout(this.visibilityTimer);
    }
    if (this.iPvisibilityTimer != null) {
      clearTimeout(this.iPvisibilityTimer);
    }
  }

  onNavigateTo(photoStringId: string) {
    if (this.activePhoto && this.queryService.getMediaStringId(this.activePhoto.gridPhoto.media) === photoStringId) {
      return;
    }

    if (this.controls) {
      this.controls.resetZoom();
    }
    const photo = this.gridPhotoQL.find(i => this.queryService.getMediaStringId(i.gridPhoto.media) === photoStringId);
    if (!photo) {
      return this.delayedMediaShow = photoStringId;
    }
    if (this.status === LightboxStates.Closed) {
      this.showLigthbox(photo.gridPhoto.media);
    } else {
      this.showPhoto(this.gridPhotoQL.toArray().indexOf(photo));
    }
    this.delayedMediaShow = null;
  }

  setGridPhotoQL(value: QueryList<GalleryPhotoComponent>) {
    if (this.subscription.photosChange != null) {
      this.subscription.photosChange.unsubscribe();
    }
    this.gridPhotoQL = value;
    this.subscription.photosChange = this.gridPhotoQL.changes.subscribe(() => {
      if (this.activePhotoId != null && this.gridPhotoQL.length > this.activePhotoId) {
        this.updateActivePhoto(this.activePhotoId);
      }
      if (this.delayedMediaShow) {
        this.onNavigateTo(this.delayedMediaShow);
      }
    });

    if (this.delayedMediaShow) {
      this.onNavigateTo(this.delayedMediaShow);
    }
  }

//noinspection JSUnusedGlobalSymbols
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.activePhoto) {
      this.animateLightbox();
      this.updateActivePhoto(this.activePhotoId);
    }
    this.updatePhotoFrameDim();
  }

  public nextImage() {
    if (this.activePhotoId + 1 < this.gridPhotoQL.length) {
      this.navigateToPhoto(this.activePhotoId + 1);
    } else {
      this.navigateToPhoto(0);
    }
  }

  public prevImage() {
    if (this.controls) {
      this.controls.pause();
    }
    if (this.activePhotoId > 0) {
      this.navigateToPhoto(this.activePhotoId - 1);
    }
  }

  public showLigthbox(photo: MediaDTO) {
    if (this.controls) {
      this.controls.resetZoom();
    }
    this.status = LightboxStates.Open;
    const selectedPhoto = this.findPhotoComponent(photo);
    if (selectedPhoto === null) {
      throw new Error('Can\'t find Photo');
    }

    const lightboxDimension = selectedPhoto.getDimension();
    lightboxDimension.top -= PageHelper.ScrollY;
    this.animating = true;
    this.animatePhoto(selectedPhoto.getDimension(), this.calcLightBoxPhotoDimension(selectedPhoto.gridPhoto.media)).onDone(() => {
      this.animating = false;
    });
    this.animateLightbox(
      lightboxDimension,
      <Dimension>{
        top: 0,
        left: 0,
        width: this.photoFrameDim.width,
        height: this.photoFrameDim.height
      });


    this.blackCanvasOpacity = 0;
    this.startPhotoDimension = selectedPhoto.getDimension();
    // disable scroll
    this.overlayService.showOverlay();
    this.blackCanvasOpacity = 1.0;
    this.showPhoto(this.gridPhotoQL.toArray().indexOf(selectedPhoto), false);
  }

  public hide() {
    this.router.navigate([],
      {queryParams: this.queryService.getParams()}).catch(console.error);
  }

  animatePhoto(from: Dimension, to: Dimension = from): AnimationPlayer {
    const elem = this._builder.build([
      style(Dimension.toString(from)),
      animate(300,
        style(Dimension.toString(to)))
    ])
      .create(this.mediaElement.elementRef.nativeElement);
    elem.play();

    return elem;
  }

  animateLightbox(from: Dimension = <Dimension>{
    top: 0,
    left: 0,
    width: this.photoFrameDim.width,
    height: this.photoFrameDim.height
  }, to: Dimension = from): AnimationPlayer {
    const elem = this._builder.build([
      style(Dimension.toString(from)),
      animate(300,
        style(Dimension.toString(to)))
    ])
      .create(this.lightboxElement.nativeElement);
    elem.play();
    return elem;
  }

  public toggleInfoPanel() {

    if (this.infoPanelWidth !== 400) {
      this.showInfoPanel();
    } else {
      this.hideInfoPanel();
    }

  }

  hideInfoPanel(_animate: boolean = true) {
    this.iPvisibilityTimer = window.setTimeout(() => {
      this.iPvisibilityTimer = null;
      this.infoPanelVisible = false;
      // this.controls.onResize();
    }, 1000);

    const starPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.media);
    this.infoPanelWidth = 0;
    this.updatePhotoFrameDim();
    const endPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.media);
    if (_animate) {
      this.animatePhoto(starPhotoPos, endPhotoPos);
    }
    if (_animate) {
      this.animateLightbox(<Dimension>{
          top: 0,
          left: 0,
          width: Math.max(this.photoFrameDim.width - 400, 0),
          height: this.photoFrameDim.height
        },
        <Dimension>{
          top: 0,
          left: 0,
          width: this.photoFrameDim.width,
          height: this.photoFrameDim.height
        });
    }
  }


  isInfoPanelAnimating(): boolean {
    return this.iPvisibilityTimer != null;
  }

  showInfoPanel() {
    this.infoPanelVisible = true;

    const starPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.media);
    this.infoPanelWidth = 400;
    this.updatePhotoFrameDim();
    const endPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.media);
    this.animatePhoto(starPhotoPos, endPhotoPos);
    this.animateLightbox(<Dimension>{
        top: 0,
        left: 0,
        width: this.photoFrameDim.width + 400,
        height: this.photoFrameDim.height
      },
      <Dimension>{
        top: 0,
        left: 0,
        width: this.photoFrameDim.width,
        height: this.photoFrameDim.height
      });
    if (this.iPvisibilityTimer != null) {
      clearTimeout(this.iPvisibilityTimer);
    }

    if (this.controls) {
      this.controls.resetZoom();
    }
  }

  public isVisible(): boolean {
    return this.status !== LightboxStates.Closed;
  }


  private updatePhotoFrameDim = () => {
    this.photoFrameDim.width = Math.max(window.innerWidth - this.infoPanelWidth, 0);
    this.photoFrameDim.height = window.innerHeight;
    this.photoFrameDim.aspect = Math.round(this.photoFrameDim.width / this.photoFrameDim.height * 100) / 100;
  };

  private navigateToPhoto(photoIndex: number) {
    this.router.navigate([],
      {queryParams: this.queryService.getParams(this.gridPhotoQL.toArray()[photoIndex].gridPhoto.media)}).catch(console.error);
  }

  private showPhoto(photoIndex: number, resize: boolean = true) {
    this.activePhoto = null;
    this.changeDetector.detectChanges();
    this.updateActivePhoto(photoIndex, resize);
  }

  private hideLightbox() {
    if (this.controls) {
      this.controls.resetZoom();
    }
    this.status = LightboxStates.Closing;
    this.fullScreenService.exitFullScreen();

    if (this.controls) {
      this.controls.pause();
    }


    this.animating = true;
    const lightboxDimension = this.activePhoto.getDimension();
    lightboxDimension.top -= PageHelper.ScrollY;
    this.blackCanvasOpacity = 0;

    this.animatePhoto(this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.media), this.activePhoto.getDimension());
    this.animateLightbox(<Dimension>{
      top: 0,
      left: 0,
      width: this.photoFrameDim.width,
      height: this.photoFrameDim.height
    }, lightboxDimension).onDone(() => {
      this.status = LightboxStates.Closed;
      this.activePhoto = null;
      this.activePhotoId = null;
      this.overlayService.hideOverlay();
    });


    this.hideInfoPanel(false);

  }

  private updateActivePhoto(photoIndex: number, resize: boolean = true) {
    const pcList = this.gridPhotoQL.toArray();


    if (photoIndex < 0 || photoIndex > this.gridPhotoQL.length) {
      throw new Error('Can\'t find the media');
    }
    this.activePhotoId = photoIndex;
    this.activePhoto = pcList[photoIndex];

    if (resize) {
      this.animatePhoto(this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.media));
    }
    this.navigation.hasPrev = photoIndex > 0;
    this.navigation.hasNext = photoIndex + 1 < pcList.length;

    const to = this.activePhoto.getDimension();

    // if target image out of screen -> scroll to there
    if (PageHelper.ScrollY > to.top || PageHelper.ScrollY + this.photoFrameDim.height < to.top) {
      PageHelper.ScrollY = to.top;
    }

  }


  private findPhotoComponent(media: MediaDTO): GalleryPhotoComponent {
    const galleryPhotoComponents = this.gridPhotoQL.toArray();
    for (let i = 0; i < galleryPhotoComponents.length; i++) {
      if (galleryPhotoComponents[i].gridPhoto.media === media) {
        return galleryPhotoComponents[i];
      }
    }
    return null;
  }

  private calcLightBoxPhotoDimension(photo: MediaDTO): Dimension {
    let width = 0;
    let height = 0;
    const photoAspect = photo.metadata.size.width / photo.metadata.size.height;
    const windowAspect = this.photoFrameDim.aspect;
    if (photoAspect < windowAspect) {
      width = Math.round(photo.metadata.size.width * (this.photoFrameDim.height / photo.metadata.size.height));
      height = this.photoFrameDim.height;
    } else {
      width = this.photoFrameDim.width;
      height = Math.round(photo.metadata.size.height * (this.photoFrameDim.width / photo.metadata.size.width));
    }
    const top = (this.photoFrameDim.height / 2 - height / 2);
    const left = (this.photoFrameDim.width / 2 - width / 2);

    return <Dimension>{top: top, left: left, width: width, height: height};
  }
}

