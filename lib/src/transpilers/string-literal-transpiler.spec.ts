import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import { StringLiteralTranspiler } from './string-literal-transpiler';

describe('StringLiteralTranspiler', () => {

    describe('tokenize function', () => {
        it('recognizes every character as a valid token', () => {
            const transpiler = new StringLiteralTranspiler(new TranslationMarkupRendererFactory(document));

            const translation = '[b]example {{ translation }} text[/b]!';

            for (const [offset, expectedToken] of translation.split('').entries()) {
                const result = transpiler.tokenize(translation, offset);

                expect(result).toBeDefined(`expected tokenize('${translation}', ${offset}) to return a token`);
                expect(result!.token).toBe(expectedToken, `expected tokenize('${translation}', ${offset}).token to be '${expectedToken}'`);
                expect(result!.nextOffset).toBe(offset + 1, `expected tokenize('${translation}', ${offset}).nextOffset to be '${offset + 1}'`);
            }
        });
    });

    describe('transpile function', () => {
        it('returns undefined for unknown tokens', () => {
            const transpiler = new StringLiteralTranspiler(new TranslationMarkupRendererFactory(document));

            const tokens = [1, null, undefined, false, true, [], {}];

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(tokens, offset)).toBeUndefined();
            }
        });

        it('transpiles sequences of character tokens', () => {
            const renderFactory = new TranslationMarkupRendererFactory(document);
            const transpiler = new StringLiteralTranspiler(renderFactory);

            const tokens = [0, 'a', 1, 'b', 'c', 'd', 2, 'e'];
            const expectedResults = [undefined, 'a', undefined, 'bcd', 'cd', 'd', undefined, 'e'];

            const renderTextSpy = spyOn(renderFactory, 'createTextRenderer').and.callThrough();

            for (const [offset, expectedResult] of expectedResults.entries()) {

                renderTextSpy.calls.reset();

                const result = transpiler.transpile(tokens, offset);

                if (expectedResult === undefined) {
                    expect(result).toBeUndefined(`expected transpile(tokens, ${offset}, context) to return undefined`);
                    expect(renderTextSpy).not.toHaveBeenCalled();
                } else {
                    expect(result).toBeDefined(`expected transpile(tokens, ${offset}, context) to return a parse result`);
                    expect(result!.nextOffset).toBe(offset + expectedResult.length);
                    expect(renderTextSpy).toHaveBeenCalledWith(expectedResult);
                }
            }

        });
    });

});
