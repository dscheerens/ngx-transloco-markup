import { InjectionToken } from '@angular/core';

import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';

/** Token used to define the `TranslationMarkupTranspiler` providers that should be available for injection. */
export const TRANSLATION_MARKUP_TRANSPILER = new InjectionToken<TranslationMarkupTranspiler>('TRANSLATION_MARKUP_TRANSPILER');
