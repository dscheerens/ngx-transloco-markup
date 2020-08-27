import { Injectable } from '@angular/core';

import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import {
    TokenizeResult,
    TranslationMarkupTranspiler,
    TranspileResult,
    TranslationMarkupTranspilerContext
} from '../translation-markup-transpiler.model';

/**
 * Transpiler used to capture literal translation texts. This transpiler will always be used as the last transpiler during the tokenization
 * and transpilation process, so it can catch any character that would otherwise not be transpiled.
 */
@Injectable({ providedIn: 'root' })
export class StringLiteralTranspiler implements TranslationMarkupTranspiler {

    /**
     * Creates a new `StringLiteralTranspiler` that uses the specified renderer factory.
     */
    constructor(
        /** Renderer factory used for creating the renderer that renders the literal string text in a text node. */
        private readonly rendererFactory: TranslationMarkupRendererFactory
    ) { }

    /** @inheritdoc */
    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        return {
            nextOffset: offset + 1,
            token: translation.charAt(offset)
        };
    }

    /** @inheritdoc */
    public transpile(start: number, { tokens }: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        let end = start;

        while (end < tokens.length && typeof tokens[end] === 'string') {
            end++;
        }

        if (end === start) {
            return undefined;
        }

        const stringLiteral = tokens.slice(start, end).join('');

        return {
            nextOffset: end,
            renderer: this.rendererFactory.createTextRenderer(stringLiteral)
        };
    }

}
