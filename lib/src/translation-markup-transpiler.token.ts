import { InjectionToken } from '@angular/core';

import { RecursiveArray } from './utils/array';
import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';

/** Token used to define the `TranslationMarkupTranspiler` providers that should be available for injection. */
export const TRANSLATION_MARKUP_TRANSPILER =
    new InjectionToken<RecursiveArray<TranslationMarkupTranspiler>>('TRANSLATION_MARKUP_TRANSPILER');
