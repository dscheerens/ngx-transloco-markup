import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { ENVIRONMENT } from './environments/environment';

if (ENVIRONMENT.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch((error) => console.log(error)); // eslint-disable-line no-console
