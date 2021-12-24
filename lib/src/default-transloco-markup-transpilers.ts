import { Provider } from '@angular/core';

import { BoldTextTranspiler } from './transpilers/bold-text-transpiler';
import { ItalicTextTranspiler } from './transpilers/italic-text-transpiler';
import { LinkTranspiler } from './transpilers/link-transpiler';
import { StringLinkRenderer, ExternalLinkObjectLinkRenderer } from './default-link-renderers';
import { provideLinkRenderer } from './link-renderer.model';
import { provideTranslationMarkupTranspiler } from './translation-markup-transpiler.token';

/**
 * Factory function for the default set of markup transpilers. Can be included in the providers array of an `@NgModule` or `@Component`
 * decorated class.
 *
 * @returns A `Provider` array for the default Transloco markup transpilers.
 */
export function defaultTranslocoMarkupTranspilers(): Provider[] {
    return [
        provideTranslationMarkupTranspiler(BoldTextTranspiler),
        provideTranslationMarkupTranspiler(ItalicTextTranspiler),
        provideTranslationMarkupTranspiler(LinkTranspiler),
        provideLinkRenderer(StringLinkRenderer),
        provideLinkRenderer(ExternalLinkObjectLinkRenderer),
    ];
}
