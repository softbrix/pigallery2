import {Component, ElementRef, Input, Output, OnChanges, ViewChild} from '@angular/core';
import {GridMedia} from '../../grid/GridMedia';
import {FixOrientationPipe} from '../../../../pipes/FixOrientationPipe';
import {MediaDTO} from '../../../../../../common/entities/MediaDTO';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'app-gallery-lightbox-media',
  styleUrls: ['./media.lightbox.gallery.component.css'],
  templateUrl: './media.lightbox.gallery.component.html'
})
export class GalleryLightboxMediaComponent implements OnChanges {

  @Input() gridMedia: GridMedia;
  @Input() loadMedia = false;
  @Input() windowAspect = 1;
  @Input() zoom = 1;
  @Input() drag = {x: 0, y: 0};

  @ViewChild('video', {static: false}) video: ElementRef<HTMLVideoElement>;

  prevGirdPhoto: GridMedia = null;

  public imageSize = {width: 'auto', height: '100'};

  private imageLoaded = false;
  public imageLoadFinished = false;

  thumbnailSrc: string = null;
  photoSrc: string = null;
  private videoProgress = 0;

  constructor(public elementRef: ElementRef,
              private _sanitizer: DomSanitizer) {
  }

  get ImageTransform(): SafeStyle {
    return this._sanitizer.bypassSecurityTrustStyle('scale(' + this.zoom +
      ') translate(calc(' + -50 / this.zoom + '% + ' + this.drag.x / this.zoom + 'px), calc(' +
      -50 / this.zoom + '% + ' + this.drag.y / this.zoom + 'px))');
  }

  ngOnChanges() {
    if (this.prevGirdPhoto !== this.gridMedia) {
      this.prevGirdPhoto = this.gridMedia;
      this.thumbnailSrc = null;
      this.photoSrc = null;
      this.imageLoaded = false;
      this.imageLoadFinished = false;
      this.setImageSize();
    }
    if (this.thumbnailSrc == null && this.gridMedia && this.ThumbnailUrl !== null) {
      FixOrientationPipe.transform(this.ThumbnailUrl, this.gridMedia.Orientation)
        .then((src) => this.thumbnailSrc = src);
    }

    if (this.photoSrc == null && this.gridMedia && this.loadMedia) {
      FixOrientationPipe.transform(this.gridMedia.getPhotoPath(), this.gridMedia.Orientation)
        .then((src) => this.photoSrc = src);
    }
  }

  /** Video **/
  private onVideoProgress() {
    this.videoProgress = (100 / this.video.nativeElement.duration) * this.video.nativeElement.currentTime;
  }

  public get VideoProgress(): number {
    return this.videoProgress;
  }


  public get VideoVolume(): number {
    if (!this.video) {
      return 1;
    }
    return this.video.nativeElement.volume;
  }

  public set VideoVolume(value: number) {
    if (!this.video) {
      return;
    }
    this.video.nativeElement.muted = false;
    this.video.nativeElement.volume = value;
  }

  public set VideoProgress(value: number) {
    if (!this.video && value === null && typeof value === 'undefined') {
      return;
    }
    this.video.nativeElement.currentTime = this.video.nativeElement.duration * (value / 100);
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play().catch(console.error);
    }
  }


  public get Muted(): boolean {
    if (!this.video) {
      return false;
    }
    return this.video.nativeElement.muted;
  }

  public mute() {
    if (!this.video) {
      return;
    }

    this.video.nativeElement.muted = !this.video.nativeElement.muted;
  }

  public playPause() {
    if (!this.video) {
      return;
    }
    if (this.video.nativeElement.paused) {
      this.video.nativeElement.play().catch(console.error);
    } else {
      this.video.nativeElement.pause();
    }
  }

  public get Paused(): boolean {
    if (!this.video) {
      return true;
    }
    return this.video.nativeElement.paused;
  }

  public getVideoType(): string {
    switch (this.gridMedia.getExtension().toLowerCase()) {
      case 'webm':
        return 'video/webm';
      case 'ogv':
      case 'ogg':
        return 'video/ogg';
      default:
        return 'video/mp4';
    }
  }

  onImageError() {
    // TODO:handle error
    this.imageLoadFinished = true;
    console.error('Error: cannot load media for lightbox url: ' + this.gridMedia.getPhotoPath());
  }


  onImageLoad() {
    this.imageLoadFinished = true;
    this.imageLoaded = true;
  }

  private get ThumbnailUrl(): string {
    if (this.gridMedia.isThumbnailAvailable() === true) {
      return this.gridMedia.getThumbnailPath();
    }

    if (this.gridMedia.isReplacementThumbnailAvailable() === true) {
      return this.gridMedia.getReplacementThumbnailPath();
    }
    return null;
  }

  public get PhotoSrc(): string {
    return this.gridMedia.getPhotoPath();
  }

  public showThumbnail(): boolean {
    return this.gridMedia &&
      !this.imageLoaded &&
      this.thumbnailSrc !== null &&
      (this.gridMedia.isThumbnailAvailable() || this.gridMedia.isReplacementThumbnailAvailable());
  }

  private setImageSize() {
    if (!this.gridMedia) {
      return;
    }


    const photoAspect = MediaDTO.calcRotatedAspectRatio(this.gridMedia.media);

    if (photoAspect < this.windowAspect) {
      this.imageSize.height = '100';
      this.imageSize.width = null;
    } else {
      this.imageSize.height = null;
      this.imageSize.width = '100';
    }
  }

}

