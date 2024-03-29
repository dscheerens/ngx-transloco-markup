import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

import { StringLiteralTranspiler } from './string-literal-transpiler';

describe('StringLiteralTranspiler', () => {

    describe('tokenize function', () => {
        it('recognizes every character as a valid token', () => {
            const transpiler = new StringLiteralTranspiler(new TranslationMarkupRendererFactory(document));

            const translation = '[b]example {{ translation }} text[/b]!';

            for (const [offset, expectedToken] of translation.split('').entries()) {
                const result = transpiler.tokenize(translation, offset);

                expect(result).withContext(`expected tokenize('${translation}', ${offset}) to return a token`).toBeDefined();
                expect(result!.token).withContext(`expected tokenize('${translation}', ${offset}).token to be '${expectedToken}'`).toBe(expectedToken);
                expect(result!.nextOffset).withContext(`expected tokenize('${translation}', ${offset}).nextOffset to be '${offset + 1}'`).toBe(offset + 1);
            }
        });
    });

    describe('transpile function', () => {
        it('returns undefined for unknown tokens', () => {
            const transpiler = new StringLiteralTranspiler(new TranslationMarkupRendererFactory(document));

            const tokens = [1, null, undefined, false, true, [], {}];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(offset, context)).toBeUndefined();
            }
        });

        it('transpiles sequences of character tokens', () => {
            const renderFactory = new TranslationMarkupRendererFactory(document);
            const transpiler = new StringLiteralTranspiler(renderFactory);

            const tokens = [0, 'a', 1, 'b', 'c', 'd', 2, 'e'];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);
            const expectedResults = [undefined, 'a', undefined, 'bcd', 'cd', 'd', undefined, 'e'];

            const renderTextSpy = spyOn(renderFactory, 'createTextRenderer').and.callThrough();

            for (const [offset, expectedResult] of expectedResults.entries()) {

                renderTextSpy.calls.reset();

                const result = transpiler.transpile(offset, context);

                if (expectedResult === undefined) {
                    expect(result).withContext(`expected transpile(tokens, ${offset}, context) to return undefined`).toBeUndefined();
                    expect(renderTextSpy).not.toHaveBeenCalled();
                } else {
                    expect(result).withContext(`expected transpile(tokens, ${offset}, context) to return a parse result`).toBeDefined();
                    expect(result!.nextOffset).toBe(offset + expectedResult.length);
                    expect(renderTextSpy).toHaveBeenCalledWith(expectedResult);
                }
            }

        });
    });

});
