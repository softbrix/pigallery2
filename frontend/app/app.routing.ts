import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes, UrlMatchResult, UrlSegment} from '@angular/router';
import {LoginComponent} from './ui/login/login.component';
import {GalleryComponent} from './ui/gallery/gallery.component';
import {AdminComponent} from './ui/admin/admin.component';
import {ShareLoginComponent} from './ui/sharelogin/share-login.component';
import {QueryParams} from '../../common/QueryParams';
import {DuplicateComponent} from './ui/duplicates/duplicates.component';
import {FacesComponent} from './ui/faces/faces.component';

export function galleryMatcherFunction(
  segments: UrlSegment[]): UrlMatchResult | null {


  if (segments.length === 0) {
    return null;
  }
  const path = segments[0].path;

  const posParams: { [key: string]: UrlSegment } = {};
  if (path === 'gallery') {
    if (segments.length > 1) {
      posParams[QueryParams.gallery.directory] = segments[1];
    }
    return {consumed: segments.slice(0, Math.min(segments.length, 2)), posParams};
  }
  if (path === 'search') {
    if (segments.length > 1) {
      posParams[QueryParams.gallery.searchText] = segments[1];
    }
    return {consumed: segments.slice(0, Math.min(segments.length, 2)), posParams};
  }
  if (path === 'share') {
    if (segments.length > 1) {
      posParams[QueryParams.gallery.sharingKey_long] = segments[1];
    }
    return {consumed: segments.slice(0, Math.min(segments.length, 2)), posParams};
  }
  return null;
}

const ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'shareLogin',
    component: ShareLoginComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: 'duplicates',
    component: DuplicateComponent
  },
  {
    path: 'faces',
    component: FacesComponent
  },
  {
    matcher: galleryMatcherFunction,
    component: GalleryComponent
  },
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: '**', redirectTo: '/login', pathMatch: 'full'}
];

export const appRoutes: ModuleWithProviders = RouterModule.forRoot(ROUTES);

