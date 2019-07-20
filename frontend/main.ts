import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {ApplicationRef, enableProdMode} from '@angular/core';
import {environment} from './environments/environment';
import {AppModule} from './app/app.module';
import {enableDebugTools} from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
} 

platformBrowserDynamic().bootstrapModule(AppModule).then(moduleRef => {
  const applicationRef = moduleRef.injector.get(ApplicationRef);
  const componentRef = applicationRef.components[0];
  // allows to run `ng.profiler.timeChangeDetection();`
  enableDebugTools(componentRef);
}).catch(err => console.error(err));
