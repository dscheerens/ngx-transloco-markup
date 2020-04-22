import { InjectionToken, inject } from '@angular/core';

import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { DefaultStringInterpolationTranspiler } from './transpilers/default-string-interpolation-transpiler';

export const STRING_INTERPOLATION_TRANSPILER = new InjectionToken<TranslationMarkupTranspiler>(
    'STRING_INTERPOLATION_TRANSPILER',
    {
        providedIn: 'root',
        factory: () => inject(DefaultStringInterpolationTranspiler)
    }
);
