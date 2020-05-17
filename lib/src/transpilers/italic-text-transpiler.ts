import { Injectable } from '@angular/core';

import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import { BlockTranspiler } from './block-transpiler';

@Injectable()
export class ItalicTextTranspiler extends BlockTranspiler {

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory
    ) {
        super('[i]', '[/i]');
    }

    protected createRenderer(childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer {
        return this.rendererFactory.createElementRenderer('i', childRenderers);
    }

}
