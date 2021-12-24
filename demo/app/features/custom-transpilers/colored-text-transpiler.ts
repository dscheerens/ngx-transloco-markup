import { Injectable } from '@angular/core';
import { HashMap } from '@ngneat/transloco';
import {
    TokenizeResult,
    TranslationMarkupRenderer,
    TranslationMarkupRendererFactory,
    TranslationMarkupTranspiler,
    TranslationMarkupTranspilerContext,
    TranspileResult,
} from 'ngx-transloco-markup';

@Injectable()
export class ColoredTextTranspiler implements TranslationMarkupTranspiler {

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory,
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        return (
            recognizeColorStartToken(translation, offset) ||
            recognizeColorEndToken(translation, offset)
        );
    }

    public transpile(
        start: number,
        context: TranslationMarkupTranspilerContext,
    ): TranspileResult | undefined {
        const nextToken = context.tokens[start];

        if (!(nextToken instanceof ColorStart)) {
            return undefined;
        }

        const { nextOffset, renderers } = context.transpileUntil(start + 1, (token) => token === COLOR_END);

        return {
            nextOffset: Math.min(nextOffset + 1, context.tokens.length),
            renderer: this.createRenderer(nextToken.cssColorValue, renderers),
        };
    }

    private createRenderer(
        cssColorValue: string,
        childRenderers: TranslationMarkupRenderer[],
    ): TranslationMarkupRenderer {
        const spanRenderer = this.rendererFactory.createElementRenderer('span', childRenderers);

        function renderColorMarkup(translationParameters: HashMap): HTMLSpanElement {
            const spanElement = spanRenderer(translationParameters);

            spanElement.style.color = cssColorValue;

            return spanElement;
        }

        return renderColorMarkup;
    }
}

function recognizeColorStartToken(translation: string, offset: number): TokenizeResult | undefined {
    const COLOR_START_TOKEN = '[c:';

    if (!translation.startsWith(COLOR_START_TOKEN, offset)) {
        return undefined;
    }

    const end = translation.indexOf(']', offset + COLOR_START_TOKEN.length);

    if (end < 0) {
        return undefined;
    }

    const cssColorValue = translation.substring(offset + COLOR_START_TOKEN.length, end);

    return {
        nextOffset: end + 1,
        token: new ColorStart(cssColorValue),
    };
}

function recognizeColorEndToken(translation: string, offset: number): TokenizeResult | undefined {
    const COLOR_END_TOKEN = '[/c]';

    if (!translation.startsWith(COLOR_END_TOKEN, offset)) {
        return undefined;
    }

    return {
        nextOffset: offset + COLOR_END_TOKEN.length,
        token: COLOR_END,
    };
}

class ColorStart {
    constructor(
        public readonly cssColorValue: string,
    ) { }
}

const COLOR_END = new (class ColorEnd { })();
