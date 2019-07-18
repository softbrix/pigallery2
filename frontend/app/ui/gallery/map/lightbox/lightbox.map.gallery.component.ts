import {Component, ElementRef, HostListener, Input, OnChanges, ViewChild, AfterViewInit} from '@angular/core';
import {PhotoDTO} from '../../../../../../common/entities/PhotoDTO';
import {Dimension} from '../../../../model/IRenderable';
import {FullScreenService} from '../../fullscreen.service';
import {IconThumbnail, Thumbnail, ThumbnailManagerService} from '../../thumbnailManager.service';
import {MediaIcon} from '../../MediaIcon';
import {Media} from '../../Media';
import {PageHelper} from '../../../../model/page.helper';
import {OrientationTypes} from 'ts-exif-parser';
import {MediaDTO} from '../../../../../../common/entities/MediaDTO';
import {FileDTO} from '../../../../../../common/entities/FileDTO';
import {Utils} from '../../../../../../common/Utils';
import {Config} from '../../../../../../common/config/public/Config';
import {MapService} from '../map.service';
import {LatLng, Point} from 'leaflet';
import {MapComponent} from '@yaga/leaflet-ng2';
import {FixOrientationPipe} from '../../../../pipes/FixOrientationPipe';

@Component({
  selector: 'app-gallery-map-lightbox',
  styleUrls: ['./lightbox.map.gallery.component.css'],
  templateUrl: './lightbox.map.gallery.component.html',
})
export class GalleryMapLightboxComponent implements OnChanges, AfterViewInit {

  @Input() photos: PhotoDTO[];
  @Input() gpxFiles: FileDTO[];
  private startPosition: Dimension = null;
  public lightboxDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public mapDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public visible = false;
  public controllersVisible = false;
  public opacity = 1.0;
  mapPhotos: MapPhoto[] = [];
  paths: LatLng[][] = [];

  @ViewChild('root', {static: false}) elementRef: ElementRef;
  @ViewChild('yagaMap', {static: false}) yagaMap: MapComponent;

  public smallIconSize = new Point(Config.Client.Thumbnail.iconSize * 0.75, Config.Client.Thumbnail.iconSize * 0.75);
  public iconSize = new Point(Config.Client.Thumbnail.iconSize, Config.Client.Thumbnail.iconSize);

  constructor(public fullScreenService: FullScreenService,
              private thumbnailService: ThumbnailManagerService,
              public mapService: MapService) {
  }

  ngOnChanges() {
    if (this.visible === false) {
      return;
    }
    this.showImages();
  }

  ngAfterViewInit() {

  }

  @HostListener('window:resize', ['$event'])
  async onResize() {
    this.lightboxDimension = <Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
    this.mapDimension = <Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
    await Utils.wait(0);
    this.yagaMap.invalidateSize();
  }



  public async show(position: Dimension) {
    this.hideImages();
    this.visible = true;
    this.opacity = 1.0;
    this.startPosition = position;
    this.lightboxDimension = position;
    this.lightboxDimension.top -= PageHelper.ScrollY;
    this.mapDimension = <Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
    this.showImages();
    this.centerMap();
    PageHelper.hideScrollY();
    await Utils.wait(0);
    this.lightboxDimension = <Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
    await Utils.wait(350);
    this.yagaMap.invalidateSize();
    this.centerMap();
    this.controllersVisible = true;
  }

  public hide() {
    this.fullScreenService.exitFullScreen();
    this.controllersVisible = false;
    const to = this.startPosition;

    // iff target image out of screen -> scroll to there
    if (PageHelper.ScrollY > to.top || PageHelper.ScrollY + this.getScreenHeight() < to.top) {
      PageHelper.ScrollY = to.top;
    }

    this.lightboxDimension = this.startPosition;
    this.lightboxDimension.top -= PageHelper.ScrollY;
    PageHelper.showScrollY();
    this.opacity = 0.0;
    setTimeout(() => {
      this.visible = false;
      this.hideImages();
      this.yagaMap.zoom = 2;
    }, 500);
  }

  showImages() {
    this.hideImages();

    this.mapPhotos = this.photos.filter(p => {
      return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData
        && p.metadata.positionData.GPSData.latitude
        && p.metadata.positionData.GPSData.longitude;
    }).map(p => {
      let width = 500;
      let height = 500;
      const rotatedSize = MediaDTO.getRotatedSize(p);
      if (rotatedSize.width > rotatedSize.height) {
        height = width * (rotatedSize.height / rotatedSize.width);
      } else {
        width = height * (rotatedSize.width / rotatedSize.height);
      }
      const iconTh = this.thumbnailService.getIcon(new MediaIcon(p));
      iconTh.Visible = true;
      const obj: MapPhoto = {
        lat: p.metadata.positionData.GPSData.latitude,
        lng: p.metadata.positionData.GPSData.longitude,
        iconThumbnail: iconTh,
        orientation: p.metadata.orientation,
        preview: {
          width: width,
          height: height,
          thumbnail: this.thumbnailService.getLazyThumbnail(new Media(p, width, height))
        }

      };
      if (iconTh.Available === true) {
        FixOrientationPipe.transform(iconTh.Src, p.metadata.orientation).then((icon) => {
          obj.iconUrl = icon;
        });
      } else {
        iconTh.OnLoad = () => {
          FixOrientationPipe.transform(iconTh.Src, p.metadata.orientation).then((icon) => {
            obj.iconUrl = icon;
          });
        };
      }
      return obj;
    });
    if (this.gpxFiles) {
      this.loadGPXFiles().catch(console.error);
    }

  }

  private centerMap() {
    if (this.mapPhotos.length > 0) {
      this.yagaMap.fitBounds(<any>this.mapPhotos);
    }
  }


  private async loadGPXFiles(): Promise<void> {
    this.paths = [];
    for (let i = 0; i < this.gpxFiles.length; i++) {
      const file = this.gpxFiles[i];
      const path = await this.mapService.getMapPath(file);
      if (file !== this.gpxFiles[i]) { // check race condition
        return;
      }
      if (path.length === 0) {
        continue;
      }
      this.paths.push(<LatLng[]>path);
    }
  }


  public loadPreview(mp: MapPhoto) {
    mp.preview.thumbnail.load();
    mp.preview.thumbnail.CurrentlyWaiting = true;
  }

  hideImages() {
    this.mapPhotos.forEach((mp) => {
      mp.iconThumbnail.destroy();
      mp.preview.thumbnail.destroy();
    });
    this.mapPhotos = [];
  }


  private getScreenWidth() {
    return window.innerWidth;
  }

  private getScreenHeight() {
    return window.innerHeight;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(e: KeyboardEvent) {
    if (this.visible !== true) {
      return;
    }
    const event: KeyboardEvent = window.event ? <any>window.event : e;
    switch (event.key) {
      case 'f':
      case 'F':
        if (this.fullScreenService.isFullScreenEnabled()) {
          this.fullScreenService.exitFullScreen();
        } else {
          this.fullScreenService.showFullScreen(this.elementRef.nativeElement);
        }
        break;
      case 'Escape': // escape
        this.hide();
        break;
    }
  }


}

export interface MapPhoto {
  lat: number;
  lng: number;
  iconUrl?: string;
  iconThumbnail: IconThumbnail;
  orientation: OrientationTypes;
  preview: {
    width: number;
    height: number;
    thumbnail: Thumbnail;
  };
}

