import { Injectable } from '@angular/core';

import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import { BlockTranspiler } from './block-transpiler';

@Injectable()
export class BoldTextMarkupTranspiler extends BlockTranspiler {

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory
    ) {
        super('[b]', '[/b]');
    }

    protected createRenderer(childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer {
        return this.rendererFactory.createElementRenderer('b', childRenderers);
    }

}
