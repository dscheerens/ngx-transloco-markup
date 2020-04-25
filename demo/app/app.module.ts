import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgModule, Injectable } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';
import { TRANSLOCO_CONFIG, TRANSLOCO_LOADER, Translation, TranslocoLoader, translocoConfig } from '@ngneat/transloco';
import { defaultTranslocoMarkupTranspilers } from 'ngx-transloco-markup';

import { environment } from '../environments/environment';

import { TranslationExamplesModule } from './common/translation-examples';
import { AppComponent } from './app.component';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    constructor(
        private readonly httpClient: HttpClient
    ) { }

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
        TranslationExamplesModule,
        MatButtonToggleModule
    ],
    providers: [
        {
            provide: TRANSLOCO_CONFIG,
            useValue: translocoConfig({
                availableLangs: ['de', 'en', 'fr', 'nl'],
                defaultLang: 'en',
                reRenderOnLangChange: true,
                prodMode: environment.production
            })
        },
        {
            provide: TRANSLOCO_LOADER,
            useClass: TranslocoHttpLoader
        },
        defaultTranslocoMarkupTranspilers()
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
