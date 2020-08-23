import { Injectable } from '@angular/core';
import { HashMap } from '@ngneat/transloco';
import {
    TokenizeResult,
    TranslationMarkupRenderer,
    TranslationMarkupRendererFactory,
    TranslationMarkupTranspiler,
    TranslationMarkupTranspilerContext,
    TranspileResult
} from 'ngx-transloco-markup';

@Injectable()
export class ColoredTextTranspiler implements TranslationMarkupTranspiler {

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        return (
            recognizeColorStartToken(translation, offset) ||
            recognizeColorEndToken(translation, offset)
        );
    }

    public transpile(
        tokens: unknown[],
        start: number,
        context: TranslationMarkupTranspilerContext
    ): TranspileResult | undefined {
        const nextToken = tokens[start];

        if (!(nextToken instanceof ColorStart)) {
            return undefined;
        }

        const childRenderers: TranslationMarkupRenderer[] = [];
        let offset = start + 1;
        while (offset < tokens.length && tokens[offset] !== COLOR_END) {
            const transpileResult = context.transpile(tokens, offset, context);

            if (transpileResult) {
                childRenderers.push(transpileResult.renderer);
                offset = transpileResult.nextOffset;
            } else {
                offset++;
            }

        }

        return {
            nextOffset: offset + 1,
            renderer: this.createRenderer(nextToken.cssColorValue, childRenderers)
        };
    }

    private createRenderer(
        cssColorValue: string,
        childRenderers: TranslationMarkupRenderer[]
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
        token: new ColorStart(cssColorValue)
    };
}

function recognizeColorEndToken(translation: string, offset: number): TokenizeResult | undefined {
    const COLOR_END_TOKEN = '[/c]';

    if (!translation.startsWith(COLOR_END_TOKEN, offset)) {
        return undefined;
    }

    return {
        nextOffset: offset + COLOR_END_TOKEN.length,
        token: COLOR_END
    };
}

class ColorStart {
    constructor(
        public readonly cssColorValue: string
    ) { }
}

const COLOR_END = new (class ColorEnd { })();
