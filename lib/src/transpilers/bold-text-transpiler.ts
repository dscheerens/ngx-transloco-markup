import { Injectable } from '@angular/core';

import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import { BlockTranspiler } from './block-transpiler';

/**
 * Transpiler that parses bold tags (`[b]...[/b]`) and creates a renderer that wraps the content in an HTML bold element (`<b>...</b>`).
 */
@Injectable()
export class BoldTextTranspiler extends BlockTranspiler {

    /**
     * Creates a `BoldTextTranspiler` instance that uses the specified renderer factory.
     */
    constructor(
        /** Renderer factory which will be used for creating the HTML bold element renderer. */
        private readonly rendererFactory: TranslationMarkupRendererFactory
    ) {
        super('[b]', '[/b]');
    }

    /** @inheritdoc */
    protected createRenderer(childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer {
        return this.rendererFactory.createElementRenderer('b', childRenderers);
    }

}
