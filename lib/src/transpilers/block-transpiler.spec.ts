import { createRootTranspilerFunction } from '../create-translation-markup-renderer';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

import { BlockTranspiler, BlockBoundary } from './block-transpiler';

class TestBlockTranspiler extends BlockTranspiler {
    constructor(
        blockStartToken: string,
        blockEndToken: string,
        protected readonly createRenderer: (childRenderers: TranslationMarkupRenderer[]) => TranslationMarkupRenderer
    ) {
        super(blockStartToken, blockEndToken);
    }
}

function commentNodeRenderFactory(): TranslationMarkupRenderer {
    return () => document.createComment('');
}

describe('BlockTranspiler', () => {
    describe('tokenize function', () => {
        it('recognizes block boundries in translations', () => {
            const transpiler = new TestBlockTranspiler('<<<', '>>>', commentNodeRenderFactory);

            const testCases = [
                { translation: 'foo <<< bar >>> baz', offset: 0, expectToken: false },
                { translation: 'foo <<< bar >>> baz', offset: 1, expectToken: false },
                { translation: 'foo <<< bar >>> baz', offset: 4, expectToken: true },
                { translation: 'foo <<< bar >>> baz', offset: 5, expectToken: false },
                { translation: 'foo <<< bar >>> baz', offset: 12, expectToken: true },
                { translation: 'foo <<< bar >>> baz', offset: 13, expectToken: false }
            ];

            for (const { translation, offset, expectToken } of testCases) {
                const result = transpiler.tokenize(translation, offset);

                if (expectToken) {
                    expect(result).toBeDefined(`expected tokenize('${translation}', ${offset}) to return a token`);
                    expect(result!.nextOffset - offset).toBe(3, `expected tokenize('${translation}', ${offset}) to return a token of length 3`);
                } else {
                    expect(result).toBeUndefined(`expected tokenize('${translation}', ${offset}) to return undefined`);
                }
            }
        });
    });

    describe('transpile function', () => {
        it('returns undefined for unknown tokens', () => {
            const transpiler = new TestBlockTranspiler('<<<', '>>>', commentNodeRenderFactory);
            const context = {
                transpile: createRootTranspilerFunction([transpiler]),
                translation: {}
            };
            const tokens = ['a', 'b', '<<<', true, false, 4, undefined, { token: '<<<' }, '>', '>', '>'];

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(tokens, offset, context)).toBeUndefined();
            }
        });

        it('transpiles the content between the block boundries', () => {
            const transpiler = new TestBlockTranspiler('<<<', '>>>', commentNodeRenderFactory);
            const context = {
                transpile: createRootTranspilerFunction([transpiler]),
                translation: {}
            };
            const tokens = [
                new BlockBoundary('<<<'),
                undefined,
                new BlockBoundary('<<<'),
                new BlockBoundary('>>>'),
                undefined,
                undefined,
                new BlockBoundary('>>>'),
            ];

            const expectedResults = [7, undefined, 4, undefined, undefined, undefined];

            for (const [offset, expectedResult] of expectedResults.entries()) {
                const result = transpiler.transpile(tokens, offset, context);

                if (expectedResult === undefined) {
                    expect(result).toBeUndefined(`expected transpile(tokens, ${offset}, context) to return undefined`);
                } else {
                    expect(result).toBeDefined(`expected transpile(tokens, ${offset}, context) to return a parse result`);
                    expect(result!.nextOffset).toBe(expectedResult, `expected transpile(tokens, ${offset}, context).nextOffset to be ${expectedResult}`);
                }
            }
        });
    });
});
