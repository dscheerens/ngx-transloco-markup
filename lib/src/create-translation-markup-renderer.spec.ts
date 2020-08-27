import { createTranslationMarkupRenderer } from './create-translation-markup-renderer';
import {
    TokenizeResult,
    TranslationMarkupTranspiler,
    TranslationMarkupTranspilerContext,
    TranspileResult
} from './translation-markup-transpiler.model';

class TestTranspiler implements TranslationMarkupTranspiler {

    constructor(
        private readonly token: string,
        private readonly disableTranspile: boolean = false,
        private readonly renderValue?: string
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        if (!translation.startsWith(this.token, offset)) {
            return undefined;
        }

        return { token: this.token, nextOffset: offset + this.token.length };
    }

    public transpile(offset: number, { tokens }: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        if (this.disableTranspile || tokens[offset] !== this.token) { // tslint:disable-line:strict-comparisons
            return undefined;
        }

        return {
            nextOffset: offset + 1,
            renderer: () => document.createTextNode(this.renderValue !== undefined ? this.renderValue : this.token),
        };
    }
}

describe('createTranslationMarkupRenderer function', () => {
    it('skips over translation segments which cannot be tokenized', () => {
        const render = createTranslationMarkupRenderer('[a],[b]-c[a]??a][a', [new TestTranspiler('[a]'), new TestTranspiler('[b]')], {});

        const renderTarget = document.createElement('div');
        render(renderTarget, {});

        expect(renderTarget.textContent).toBe('[a][b][a]');
    });

    it('returns a renderer that clears out the target element before rendering', () => {
        const render = createTranslationMarkupRenderer('[b][a]', [new TestTranspiler('[a]'), new TestTranspiler('[b]')], {});

        const renderTarget = document.createElement('div');
        renderTarget.appendChild(document.createTextNode('(this text should be cleared)'));
        render(renderTarget, {});

        expect(renderTarget.textContent).toBe('[b][a]');
    });

    it('skips over tokens which are not processed by any transpiler', () => {
        const render = createTranslationMarkupRenderer('[b][a][b][a][b]', [new TestTranspiler('[a]'), new TestTranspiler('[b]', true)], {});

        const renderTarget = document.createElement('div');
        render(renderTarget, {});

        expect(renderTarget.textContent).toBe('[a][a]');
    });

    it('uses the transpiler order to resolve matching conflicts', () => {
        const render = createTranslationMarkupRenderer(
            '***-**-*--*---',
            [
                new TestTranspiler('*', false, '[a]'),
                new TestTranspiler('*', false, '[b]'),
                new TestTranspiler('-', false, '[c]')
            ],
            {}
        );

        const renderTarget = document.createElement('div');
        render(renderTarget, {});

        expect(renderTarget.textContent).toBe('[a][a][a][c][a][a][c][a][c][c][a][c][c][c]');
    });

});
