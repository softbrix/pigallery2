import {Injectable, LOCALE_ID, NgModule, TRANSLATIONS, TRANSLATIONS_FORMAT} from '@angular/core';
import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {appRoutes} from './app.routing';
import {UserService} from './model/network/user.service';
import {GalleryService} from './ui/gallery/gallery.service';
import {NetworkService} from './model/network/network.service';
import {GalleryCacheService} from './ui/gallery/cache.gallery.service';
import {FullScreenService} from './ui/gallery/fullscreen.service';
import {AuthenticationService} from './model/network/authentication.service';
import {UserMangerSettingsComponent} from './ui/settings/usermanager/usermanager.settings.component';
import {FrameComponent} from './ui/frame/frame.component';
import {YagaModule} from '@yaga/leaflet-ng2';
import {GalleryLightboxMediaComponent} from './ui/gallery/lightbox/media/media.lightbox.gallery.component';
import {GalleryPhotoLoadingComponent} from './ui/gallery/grid/photo/loading/loading.photo.grid.gallery.component';
import {GalleryNavigatorComponent} from './ui/gallery/navigator/navigator.gallery.component';
import {GallerySearchComponent} from './ui/gallery/search/search.gallery.component';
import {GalleryLightboxComponent} from './ui/gallery/lightbox/lightbox.gallery.component';
import {GalleryDirectoryComponent} from './ui/gallery/directories/directory/directory.gallery.component';
import {GalleryGridComponent} from './ui/gallery/grid/grid.gallery.component';
import {GalleryPhotoComponent} from './ui/gallery/grid/photo/photo.grid.gallery.component';
import {LoginComponent} from './ui/login/login.component';
import {AdminComponent} from './ui/admin/admin.component';
import {GalleryComponent} from './ui/gallery/gallery.component';
import {StringifyRole} from './pipes/StringifyRolePipe';
import {GalleryMapComponent} from './ui/gallery/map/map.gallery.component';
import {GalleryMapLightboxComponent} from './ui/gallery/map/lightbox/lightbox.map.gallery.component';
import {ThumbnailManagerService} from './ui/gallery/thumbnailManager.service';
import {OverlayService} from './ui/gallery/overlay.service';
import {SlimLoadingBarModule} from 'ng2-slim-loading-bar';
import {GalleryShareComponent} from './ui/gallery/share/share.gallery.component';
import {ShareLoginComponent} from './ui/sharelogin/share-login.component';
import {ShareService} from './ui/gallery/share.service';
import {ModalModule} from 'ngx-bootstrap/modal';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {DatabaseSettingsComponent} from './ui/settings/database/database.settings.component';
import {ToastrModule} from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NotificationService} from './model/notification.service';
import {JwBootstrapSwitchNg2Module} from 'jw-bootstrap-switch-ng2';
import {ClipboardModule} from 'ngx-clipboard';
import {NavigationService} from './model/navigation.service';
import {InfoPanelLightboxComponent} from './ui/gallery/lightbox/infopanel/info-panel.lightbox.gallery.component';
import {MapSettingsComponent} from './ui/settings/map/map.settings.component';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {CollapseModule} from 'ngx-bootstrap/collapse';
import {PopoverModule} from 'ngx-bootstrap/popover';
import {ThumbnailSettingsComponent} from './ui/settings/thumbnail/thumbanil.settings.component';
import {SearchSettingsComponent} from './ui/settings/search/search.settings.component';
import {SettingsService} from './ui/settings/settings.service';
import {ShareSettingsComponent} from './ui/settings/share/share.settings.component';
import {BasicSettingsComponent} from './ui/settings/basic/basic.settings.component';
import {OtherSettingsComponent} from './ui/settings/other/other.settings.component';
import {HttpClientModule} from '@angular/common/http';
import {DefaultUrlSerializer, UrlSerializer, UrlTree} from '@angular/router';
import {IndexingSettingsComponent} from './ui/settings/indexing/indexing.settings.component';
import {LanguageComponent} from './ui/language/language.component';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {QueryService} from './model/query.service';
import {IconizeSortingMethod} from './pipes/IconizeSortingMethod';
import {StringifySortingMethod} from './pipes/StringifySortingMethod';
import {RandomQueryBuilderGalleryComponent} from './ui/gallery/random-query-builder/random-query-builder.gallery.component';
import {RandomPhotoSettingsComponent} from './ui/settings/random-photo/random-photo.settings.component';
import {FixOrientationPipe} from './pipes/FixOrientationPipe';
import {VideoSettingsComponent} from './ui/settings/video/video.settings.component';
import {DurationPipe} from './pipes/DurationPipe';
import {MapService} from './ui/gallery/map/map.service';
import {MetaFileSettingsComponent} from './ui/settings/metafiles/metafile.settings.component';
import {ThumbnailLoaderService} from './ui/gallery/thumbnailLoader.service';
import {FileSizePipe} from './pipes/FileSizePipe';
import {DuplicateService} from './ui/duplicates/duplicates.service';
import {DuplicateComponent} from './ui/duplicates/duplicates.component';
import {DuplicatesPhotoComponent} from './ui/duplicates/photo/photo.duplicates.component';
import {SeededRandomService} from './model/seededRandom.service';
import {FacesComponent} from './ui/faces/faces.component';
import {FacesService} from './ui/faces/faces.service';
import {FaceComponent} from './ui/faces/face/face.component';
import {VersionService} from './model/version.service';
import { DirectoriesComponent } from './ui/gallery/directories/directories.component';


@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  events: string[] = ['pinch'];
  overrides = {
    pan: {threshold: 1},
    swipe: {direction: 31}, // enable swipe up
    pinch: {enable: true}
  };
}


export class CustomUrlSerializer implements UrlSerializer {
  private _defaultUrlSerializer: DefaultUrlSerializer = new DefaultUrlSerializer();

  parse(url: string): UrlTree {
    // Encode parentheses
    url = url.replace(/\(/g, '%28').replace(/\)/g, '%29');
    // Use the default serializer.
    return this._defaultUrlSerializer.parse(url);
  }

  serialize(tree: UrlTree): string {
    return this._defaultUrlSerializer.serialize(tree).replace(/%28/g, '(').replace(/%29/g, ')');
  }
}

// use the require method provided by webpack
declare const require: (path: string) => string;

export function translationsFactory(locale: string) {
  locale = locale || 'en'; // default to english if no locale

  // default locale, nothing to translate
  if (locale === 'en') {
    return '';
  }
  return require(`raw-loader!../translate/messages.${locale}.xlf`);
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    appRoutes,
    ClipboardModule,
    JwBootstrapSwitchNg2Module,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(),
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    SlimLoadingBarModule.forRoot(),
    BsDatepickerModule.forRoot(),
    YagaModule
  ],
  declarations: [AppComponent,
    LoginComponent,
    ShareLoginComponent,
    GalleryComponent,
    FacesComponent,
    // misc
    FrameComponent,
    LanguageComponent,
    // Gallery
    GalleryLightboxMediaComponent,
    GalleryPhotoLoadingComponent,
    GalleryGridComponent,
    GalleryDirectoryComponent,
    GalleryLightboxComponent,
    GalleryMapComponent,
    GalleryMapLightboxComponent,
    FrameComponent,
    GallerySearchComponent,
    GalleryShareComponent,
    GalleryNavigatorComponent,
    GalleryPhotoComponent,
    AdminComponent,
    InfoPanelLightboxComponent,
    RandomQueryBuilderGalleryComponent,
    // Face
    FaceComponent,
    // Settings
    UserMangerSettingsComponent,
    DatabaseSettingsComponent,
    MapSettingsComponent,
    ThumbnailSettingsComponent,
    VideoSettingsComponent,
    MetaFileSettingsComponent,
    SearchSettingsComponent,
    ShareSettingsComponent,
    RandomPhotoSettingsComponent,
    BasicSettingsComponent,
    OtherSettingsComponent,
    IndexingSettingsComponent,
    DuplicateComponent,
    DuplicatesPhotoComponent,
    StringifyRole,
    IconizeSortingMethod,
    StringifySortingMethod,
    FixOrientationPipe,
    DurationPipe,
    FileSizePipe,
    DirectoriesComponent
  ],
  providers: [
    {provide: UrlSerializer, useClass: CustomUrlSerializer},
    {provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig},
    NetworkService,
    ShareService,
    UserService,
    GalleryCacheService,
    GalleryService,
    MapService,
    AuthenticationService,
    ThumbnailLoaderService,
    ThumbnailManagerService,
    NotificationService,
    FullScreenService,
    NavigationService,
    SettingsService,
    SeededRandomService,
    OverlayService,
    QueryService,
    DuplicateService,
    FacesService,
    VersionService,
    {
      provide: TRANSLATIONS,
      useFactory: translationsFactory,
      deps: [LOCALE_ID]
    },
    {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'},
    I18n
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
