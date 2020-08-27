import { Injectable } from '@angular/core';
import {
    TranslationMarkupRendererFactory,
    TranslationMarkupTranspiler,
    TranslationMarkupTranspilerContext,
    TranspileResult,
    TokenizeResult
} from 'ngx-transloco-markup';

const EMOTICON_MAP = new Map<string, string>([
    [':)', '\u{1F642}'],
    [':D', '\u{1F600}'],
    [';)', '\u{1F609}'],
    ['xD', '\u{1F606}'],
    ['XD', '\u{1F606}'],
    ['B)', '\u{1F60E}'],
    [':|', '\u{1F610}'],
    [':(', '\u{1F641}'],
    ['>:(', '\u{1F620}'],
]);

@Injectable()
export class EmoticonTranspiler implements TranslationMarkupTranspiler {

    constructor(
        private readonly translationMarkupRendererFactory: TranslationMarkupRendererFactory
    ) {}

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        for (const [key, value] of EMOTICON_MAP) {
            if (translation.startsWith(key, offset)) {
                return {
                    token: new Emoticon(value),
                    nextOffset: offset + key.length
                };
            }
        }

        return undefined;
    }

    public transpile(offset: number, { tokens }: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        const nextToken = tokens[offset];

        if (!(nextToken instanceof Emoticon)) {
            return undefined;
        }

        return {
            nextOffset: offset + 1,
            renderer: this.translationMarkupRendererFactory.createTextRenderer(nextToken.value)
        };

    }
}

class Emoticon {
    constructor(public readonly value: string) { }
}
