import { InjectionToken } from '@angular/core';

import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';

export const TRANSLATION_MARKUP_TRANSPILER = new InjectionToken<TranslationMarkupTranspiler>('TRANSLATION_MARKUP_TRANSPILER');
