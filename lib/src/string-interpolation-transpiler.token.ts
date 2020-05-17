import { InjectionToken, inject } from '@angular/core';

import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { StringInterpolationTranspiler } from './transpilers/string-interpolation-transpiler';

export const STRING_INTERPOLATION_TRANSPILER = new InjectionToken<TranslationMarkupTranspiler>(
    'STRING_INTERPOLATION_TRANSPILER',
    {
        providedIn: 'root',
        factory: () => inject(StringInterpolationTranspiler)
    }
);
