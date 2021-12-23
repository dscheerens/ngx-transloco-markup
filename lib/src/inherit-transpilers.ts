import { FactoryProvider, SkipSelf } from '@angular/core';

import { RecursiveArray } from './utils/array';
import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';

/**
 * Returns a provider that makes transpilers from a parent injector available in the child injector. This is needed if you define
 * additional translation markup transpilers that are scoped to a specific module or component. Doing so will override the transpilers from
 * the parent injector. Including the provider from the `inheritTranslationMarkupTranspilers` function will make those transpilers also
 * available.
 */
export function inheritTranslationMarkupTranspilers(): FactoryProvider {
    return {
        provide: TRANSLATION_MARKUP_TRANSPILER,
        useFactory: (transpilers: RecursiveArray<TranslationMarkupTranspiler>) => transpilers,
        deps: [[SkipSelf, TRANSLATION_MARKUP_TRANSPILER]],
        multi: true,
    };
}
