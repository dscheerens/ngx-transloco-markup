import { Provider } from '@angular/core';

import { BoldTextMarkupTranspiler } from './transpilers/bold-text-markup-transpiler';
import { ItalicTextMarkupTranspiler } from './transpilers/italic-text-markup-transpiler';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';

export function defaultTranslocoMarkupTranspilers(): Provider[] {
    return [
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: BoldTextMarkupTranspiler, multi: true },
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: ItalicTextMarkupTranspiler, multi: true }
    ];
}
