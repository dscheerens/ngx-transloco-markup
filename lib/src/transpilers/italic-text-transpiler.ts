import { Injectable } from '@angular/core';

import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import { BlockTranspiler } from './block-transpiler';

/**
 * Transpiler that parses italic tags (`[i]...[/i]`) and creates a renderer that wraps the content in an HTML italic element (`<i>...</i>`).
 */
@Injectable()
export class ItalicTextTranspiler extends BlockTranspiler {

    /**
     * Creates an `ItalicTextTranspiler` instance that uses the specified renderer factory.
     */
    constructor(
        /** Renderer factory which will be used for creating the HTML italic element renderer. */
        private readonly rendererFactory: TranslationMarkupRendererFactory,
    ) {
        super('[i]', '[/i]');
    }

    /** @inheritdoc */
    protected createRenderer(childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer {
        return this.rendererFactory.createElementRenderer('i', childRenderers);
    }

}
