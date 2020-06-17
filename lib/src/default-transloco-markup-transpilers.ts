import { Provider } from '@angular/core';

import { BoldTextTranspiler } from './transpilers/bold-text-transpiler';
import { ItalicTextTranspiler } from './transpilers/italic-text-transpiler';
import { LinkTranspiler } from './transpilers/link-transpiler';
import { StringLinkRenderer, ExternalLinkObjectLinkRenderer } from './default-link-renderers';
import { LinkRenderer } from './link-renderer.model';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';

/**
 * Factory function for the default set of markup transpilers. Can be included in the providers array of an `@NgModule` or `@Component`
 * decorated class.
 *
 * @returns A `Provider` array for the default Transloco markup transpilers.
 */
export function defaultTranslocoMarkupTranspilers(): Provider[] {
    return [
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: BoldTextTranspiler, multi: true },
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: ItalicTextTranspiler, multi: true },
        { provide: TRANSLATION_MARKUP_TRANSPILER, useClass: LinkTranspiler, multi: true },
        { provide: LinkRenderer, useClass: StringLinkRenderer, multi: true },
        { provide: LinkRenderer, useClass: ExternalLinkObjectLinkRenderer, multi: true }
    ];
}
