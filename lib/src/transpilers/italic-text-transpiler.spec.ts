import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

import { BlockBoundary } from './block-transpiler';
import { ItalicTextTranspiler } from './italic-text-transpiler';

function createTestTranspiler(): ItalicTextTranspiler {
    return new ItalicTextTranspiler(new TranslationMarkupRendererFactory(document));
}

describe('ItalicTextTranspiler', () => {
    describe('tokenize function', () => {
        it('correctly recognizes the italic start and boundaries', () => {
            const transpiler = createTestTranspiler();

            const translation = 'a[bc][[i]de[/c][/[/i][i]';
            const expectedTokenOffsets = [6, 17, 21];

            for (const [offset] of translation.split('').entries()) {
                const result = transpiler.tokenize(translation, offset);

                if (expectedTokenOffsets.includes(offset)) {
                    expect(result).toBeDefined();
                } else {
                    expect(result).toBeUndefined();
                }
            }
        });
    });

    describe('transpile function', () => {
        it('returns undefined for unknown tokens', () => {
            const transpiler = createTestTranspiler();
            const tokens = [0, 'a', '[i]', new BlockBoundary('[a]'), new BlockBoundary('[/c]'), ['/b']];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(offset, context)).toBeUndefined();
            }
        });

        it('transpiles the content between the italic tags', () => {
            const transpiler = createTestTranspiler();
            const tokens = [
                0,
                new BlockBoundary('[i]'),
                0,
                new BlockBoundary('[i]'),
                new BlockBoundary('[/i]'),
                new BlockBoundary('[/i]'),
                new BlockBoundary('[i]'),
                0,
                new BlockBoundary('[/i]'),
            ];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            const expectedResults = [0, 5, 0, 2, 0, 0, 3, 0, 0];

            for (const [offset, expectedResult] of expectedResults.entries()) {
                const result = transpiler.transpile(offset, context);

                if (expectedResult === 0) {
                    expect(result).toBeUndefined();
                } else {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset - offset).toBe(expectedResult);
                }
            }
        });
    });
});
