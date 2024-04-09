import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@jsverse/transloco';
import { TranslocoMarkupComponent, inheritTranslationMarkupTranspilers, provideTranslationMarkupTranspiler } from 'ngx-transloco-markup';

import { ColoredTextTranspiler } from './colored-text-transpiler';
import { CUSTOM_TRANSPILERS_TRANSLATION_KEYS } from './custom-transpilers-translation-keys';
import { EmoticonTranspiler } from './emoticon-transpiler';

@Component({
    selector: 'app-custom-transpilers-feature',
    templateUrl: './custom-transpilers-feature.component.html',
    styleUrls: ['./custom-transpilers-feature.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatCardModule,
        TranslocoModule,
        TranslocoMarkupComponent,
    ],
    providers: [
        provideTranslationMarkupTranspiler(EmoticonTranspiler),
        provideTranslationMarkupTranspiler(ColoredTextTranspiler),
        inheritTranslationMarkupTranspilers(),
    ],
})
export class CustomTranspilersFeatureComponent {
    public readonly TRANSLATIONS = CUSTOM_TRANSPILERS_TRANSLATION_KEYS;
}
