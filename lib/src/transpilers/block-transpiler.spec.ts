import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

import { BlockTranspiler, BlockBoundary } from './block-transpiler';

class TestBlockTranspiler extends BlockTranspiler {
    constructor(
        blockStartToken: string,
        blockEndToken: string,
        protected readonly createRenderer: (childRenderers: TranslationMarkupRenderer[]) => TranslationMarkupRenderer,
    ) {
        super(blockStartToken, blockEndToken);
    }
}

function commentNodeRenderFactory(): TranslationMarkupRenderer {
    return () => document.createComment('');
}

function createTestTranspiler(): TestBlockTranspiler {
    return new TestBlockTranspiler('<<<', '>>>', commentNodeRenderFactory);
}

describe('BlockTranspiler', () => {
    describe('tokenize function', () => {
        it('recognizes block boundaries in translations', () => {
            const transpiler = createTestTranspiler();

            const testCases = [
                { translation: 'foo <<< bar >>> baz', offset: 0, expectToken: false },
                { translation: 'foo <<< bar >>> baz', offset: 1, expectToken: false },
                { translation: 'foo <<< bar >>> baz', offset: 4, expectToken: true },
                { translation: 'foo <<< bar >>> baz', offset: 5, expectToken: false },
                { translation: 'foo <<< bar >>> baz', offset: 12, expectToken: true },
                { translation: 'foo <<< bar >>> baz', offset: 13, expectToken: false },
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
            const transpiler = createTestTranspiler();
            const tokens = ['a', 'b', '<<<', true, false, 4, undefined, { token: '<<<' }, '>', '>', '>'];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(offset, context)).toBeUndefined();
            }
        });

        it('transpiles the content between the block boundaries', () => {
            const transpiler = createTestTranspiler();
            const tokens = [
                new BlockBoundary('<<<'),
                undefined,
                new BlockBoundary('<<<'),
                new BlockBoundary('>>>'),
                undefined,
                undefined,
                new BlockBoundary('>>>'),
            ];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            const expectedResults = [7, 0, 2, 0, 0, 0];

            for (const [offset, expectedResult] of expectedResults.entries()) {
                const result = transpiler.transpile(offset, context);

                if (expectedResult === 0) {
                    expect(result).toBeUndefined(`expected transpile(tokens, ${offset}, context) to return undefined`);
                } else {
                    expect(result).toBeDefined(`expected transpile(tokens, ${offset}, context) to return a parse result`);
                    expect(result!.nextOffset - offset).toBe(expectedResult, `expected transpile(tokens, ${offset}, context).nextOffset - offset to be ${expectedResult}`);
                }
            }
        });

        it('can handle syntax errors', () => {
            const transpiler = createTestTranspiler();

            const testCases = [
                { tokens: [new BlockBoundary('<<<')], expectedNextOffset: 1 },
                { tokens: [new BlockBoundary('<<<'), new BlockBoundary('<<<')], expectedNextOffset: 2 },
                { tokens: [new BlockBoundary('>>>')], expectedNextOffset: 0 },
            ];

            for (const { tokens, expectedNextOffset } of testCases) {
                const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);
                const result = transpiler.transpile(0, context);
                if (expectedNextOffset === 0) {
                    expect(result).toBeUndefined();
                } else {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset).toBe(expectedNextOffset, 'tokens.length = ' + tokens.length);
                }
            }
        });

        it('recursively transpiles its content', () => {
            const transpiler = createTestTranspiler();

            const start = new BlockBoundary('<<<');
            const end = new BlockBoundary('>>>');

            const testCases = [
                { tokens: [start], expectedRecursiveTranspileOffsets: [] },
                { tokens: [end, start], expectedRecursiveTranspileOffsets: [] },
                { tokens: [start, end], expectedRecursiveTranspileOffsets: [] },
                { tokens: [start, 0, end], expectedRecursiveTranspileOffsets: [1] },
                {
                    tokens: [start, 0, start, 0, end, start, start, 0, end, end, start, end, end],
                    expectedRecursiveTranspileOffsets: [1, 2, 3, 5, 6, 7, 10],
                },
            ];

            for (const { tokens, expectedRecursiveTranspileOffsets } of testCases) {
                const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);
                const rootTranspilerSpy = spyOn(context, 'transpile').and.callThrough();

                transpiler.transpile(0, context);

                const actualRecursiveTranspileOffsets = rootTranspilerSpy.calls.all().map((call) => call.args[0]);

                expect(actualRecursiveTranspileOffsets).toEqual(expectedRecursiveTranspileOffsets);
            }
        });
    });
});
