import { CommonModule } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { TranslocoMarkupModule } from 'ngx-transloco-markup';

import { InnerTranslationExamplesComponent } from './inner-translation-examples.component';
import { TranslationExamplesComponent } from './translation-examples.component';

@NgModule({
    imports: [
        CommonModule,
        PortalModule,
        TranslocoModule,
        TranslocoMarkupModule
    ],
    declarations: [
        InnerTranslationExamplesComponent,
        TranslationExamplesComponent
    ],
    exports: [
        TranslationExamplesComponent
    ],
    entryComponents: [
        InnerTranslationExamplesComponent
    ]
})
export class TranslationExamplesModule {

}
