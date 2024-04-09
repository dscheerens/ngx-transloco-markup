import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Translation, TranslocoLoader, TranslocoModule, provideTransloco, translocoConfig } from '@jsverse/transloco';
import { defaultTranslocoMarkupTranspilers } from 'ngx-transloco-markup';
import { Observable } from 'rxjs';

import { ENVIRONMENT } from '../environments/environment';

import { AppComponent } from './app.component';
import { NavigationBarModule } from './common/view/navigation-bar';
import { BasicFeatureComponent } from './features/basic';
import { CustomTranspilersFeatureComponent } from './features/custom-transpilers';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    constructor(
        private readonly httpClient: HttpClient,
    ) {}

    public getTranslation(language: string): Observable<Translation> {
        return this.httpClient.get<Translation>(`/assets/translations/${language}.json`);
    }
}

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
        BrowserAnimationsModule,
        MatButtonToggleModule,
        NavigationBarModule,
        BasicFeatureComponent,
        CustomTranspilersFeatureComponent,
        TranslocoModule,
    ],
    providers: [
        provideTransloco({
            config: translocoConfig({
                availableLangs: ['en', 'nl'],
                defaultLang: 'en',
                reRenderOnLangChange: true,
                prodMode: ENVIRONMENT.production,
            }),
            loader: TranslocoHttpLoader,
        }),
        defaultTranslocoMarkupTranspilers(),
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule {}
