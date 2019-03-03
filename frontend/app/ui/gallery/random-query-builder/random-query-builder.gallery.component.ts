import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Utils} from '../../../../../common/Utils';
import {GalleryService} from '../gallery.service';
import {ContentWrapper} from '../../../../../common/entities/ConentWrapper';
import {Config} from '../../../../../common/config/public/Config';
import {NotificationService} from '../../../model/notification.service';
import {DirectoryDTO} from '../../../../../common/entities/DirectoryDTO';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {OrientationType, RandomQueryDTO} from '../../../../../common/entities/RandomQueryDTO';
import {NetworkService} from '../../../model/network/network.service';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-gallery-random-query-builder',
  templateUrl: './random-query-builder.gallery.component.html',
  styleUrls: ['./random-query-builder.gallery.component.css'],
})
export class RandomQueryBuilderGalleryComponent implements OnInit, OnDestroy {

  enabled = true;
  url = '';

  data: RandomQueryDTO = {
    orientation: OrientationType.any,
    directory: '',
    recursive: true,
    minResolution: null,
    maxResolution: null,
    toDate: null,
    fromDate: null
  };
  contentSubscription: Subscription = null;

  readonly OrientationType: typeof OrientationType;
  modalRef: BsModalRef;

  text = {
    Yes: 'Yes',
    No: 'No'
  };

  constructor(public _galleryService: GalleryService,
              private  _notification: NotificationService,
              public i18n: I18n,
              private modalService: BsModalService) {
    this.OrientationType = OrientationType;
    this.text.Yes = i18n('Yes');
    this.text.No = i18n('No');
  }


  ngOnInit() {
    this.contentSubscription = this._galleryService.content.subscribe((content: ContentWrapper) => {
      this.enabled = !!content.directory;
      if (!this.enabled) {
        return;
      }
      this.data.directory = Utils.concatUrls((<DirectoryDTO>content.directory).path, (<DirectoryDTO>content.directory).name);
    });
  }

  ngOnDestroy() {
    if (this.contentSubscription !== null) {
      this.contentSubscription.unsubscribe();
    }
  }

  update() {
    setTimeout(() => {
      const data = Utils.clone(this.data);
      for (const key of Object.keys(data)) {
        if (!(<any>data)[key]) {
          delete (<any>data)[key];
        }
      }
      this.url = NetworkService.buildUrl(Config.Client.publicUrl + '/api/gallery/random/', data);
    }, 0);
  }

  openModal(template: TemplateRef<any>) {
    if (!this.enabled) {
      return;
    }
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.modalRef = this.modalService.show(template);
    document.body.style.paddingRight = '0px';
    this.update();
    return false;
  }

  onCopy() {
    this._notification.success(this.i18n('Url has been copied to clipboard'));
  }

  public hideModal() {
    this.modalRef.hide();
    this.modalRef = null;
  }

}
