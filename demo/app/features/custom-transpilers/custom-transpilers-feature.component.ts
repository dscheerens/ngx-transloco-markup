import { ChangeDetectionStrategy, Component } from '@angular/core';
import { inheritTranspilers, provideTranslationMarkupTranspiler } from 'ngx-transloco-markup';

import { ColoredTextTranspiler } from './colored-text-transpiler';
import { CUSTOM_TRANSPILERS_TRANSLATION_KEYS } from './custom-transpilers-translation-keys';
import { EmoticonTranspiler } from './emoticon-transpiler';

@Component({
    selector: 'app-custom-transpilers-feature',
    templateUrl: './custom-transpilers-feature.component.html',
    styleUrls: ['./custom-transpilers-feature.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        provideTranslationMarkupTranspiler(EmoticonTranspiler),
        provideTranslationMarkupTranspiler(ColoredTextTranspiler),
        inheritTranspilers()
    ]
})
export class CustomTranspilersFeatureComponent {

    public readonly TRANSLATIONS = CUSTOM_TRANSPILERS_TRANSLATION_KEYS;

}
