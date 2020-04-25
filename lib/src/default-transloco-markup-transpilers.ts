import { Provider } from '@angular/core';

import { BoldTextMarkupTranspiler } from './transpilers/bold-text-markup-transpiler';
import { ItalicTextMarkupTranspiler } from './transpilers/italic-text-markup-transpiler';
import { LinkTranspiler } from './transpilers/link-transpiler';
import { StringLinkRenderer, ExternalLinkObjectLinkRenderer } from './default-link-renderers';
import { LinkRenderer } from './link-renderer.model';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';

export function defaultTranslocoMarkupTranspilers(): Provider[] {
    return [
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: BoldTextMarkupTranspiler, multi: true },
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: ItalicTextMarkupTranspiler, multi: true },
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: LinkTranspiler, multi: true },
        { provide: LinkRenderer, useClass: StringLinkRenderer, multi: true },
        { provide: LinkRenderer, useClass: ExternalLinkObjectLinkRenderer, multi: true }
    ];
}
