import { InjectionToken, inject } from '@angular/core';

import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { StringInterpolationTranspiler } from './transpilers/string-interpolation-transpiler';

/** Injection token for defining the provider to resolve the transpiler used for string interpolation expressions. */
export const STRING_INTERPOLATION_TRANSPILER = new InjectionToken<TranslationMarkupTranspiler>(
    'STRING_INTERPOLATION_TRANSPILER',
    {
        providedIn: 'root',
        factory: () => inject(StringInterpolationTranspiler),
    },
);
