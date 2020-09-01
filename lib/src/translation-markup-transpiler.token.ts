import { InjectionToken, Provider } from '@angular/core';

import { RecursiveArray } from './utils/array';
import { UnboundProvider, bindProvider } from './utils/provider-binding';
import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';

/** Token used to define the `TranslationMarkupTranspiler` providers that should be available for injection. */
export const TRANSLATION_MARKUP_TRANSPILER =
    new InjectionToken<RecursiveArray<TranslationMarkupTranspiler>>('TRANSLATION_MARKUP_TRANSPILER');

/**
 * Creates a provider definition for the specified markup transpiler. The resulting `Provider` object can be used to make the transpiler
 * available within a module or component injector scope.
 *
 * @param transpiler Specification of the markup transpiler for which the provider definition is to be created.
 */
export function provideTranslationMarkupTranspiler(transpiler: UnboundProvider<TranslationMarkupTranspiler>): Provider {
    return bindProvider(TRANSLATION_MARKUP_TRANSPILER, transpiler, { multi: true });
}
