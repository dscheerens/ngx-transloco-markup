import { Injectable } from '@angular/core';

import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult } from '../translation-markup-transpiler.model';

@Injectable({ providedIn: 'root' })
export class StringLiteralTranspiler implements TranslationMarkupTranspiler {

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        return {
            nextOffset: offset + 1,
            token: translation.charAt(offset)
        };
    }

    public transpile(tokens: unknown[], start: number): TranspileResult | undefined {
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
