import { createRootTranspilerFunction } from '../create-translation-markup-renderer';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

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

function createTestTranspiler(): { transpiler: TestBlockTranspiler; context: TranslationMarkupTranspilerContext } {
    const transpiler = new TestBlockTranspiler('<<<', '>>>', commentNodeRenderFactory);
    const context = {
        transpile: createRootTranspilerFunction([transpiler]),
        translation: {}
    };

    return { transpiler, context };
}

describe('BlockTranspiler', () => {
    describe('tokenize function', () => {
        it('recognizes block boundaries in translations', () => {
            const { transpiler } = createTestTranspiler();

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
            const { transpiler, context } = createTestTranspiler();
            const tokens = ['a', 'b', '<<<', true, false, 4, undefined, { token: '<<<' }, '>', '>', '>'];

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(tokens, offset, context)).toBeUndefined();
            }
        });

        it('transpiles the content between the block boundaries', () => {
            const { transpiler, context } = createTestTranspiler();
            const tokens = [
                new BlockBoundary('<<<'),
                undefined,
                new BlockBoundary('<<<'),
                new BlockBoundary('>>>'),
                undefined,
                undefined,
                new BlockBoundary('>>>'),
            ];

            const expectedResults = [7, 0, 2, 0, 0, 0];

            for (const [offset, expectedResult] of expectedResults.entries()) {
                const result = transpiler.transpile(tokens, offset, context);

                if (expectedResult === 0) {
                    expect(result).toBeUndefined(`expected transpile(tokens, ${offset}, context) to return undefined`);
                } else {
                    expect(result).toBeDefined(`expected transpile(tokens, ${offset}, context) to return a parse result`);
                    expect(result!.nextOffset - offset).toBe(expectedResult, `expected transpile(tokens, ${offset}, context).nextOffset - offset to be ${expectedResult}`);
                }
            }
        });

        it('can handle syntax errors', () => {
            const { transpiler, context } = createTestTranspiler();

            const testCases = [
                { tokens: [new BlockBoundary('<<<')], expectedParseLength: 1 },
                { tokens: [new BlockBoundary('<<<'), new BlockBoundary('<<<')], expectedParseLength: 2 },
                { tokens: [new BlockBoundary('>>>')], expectedParseLength: 0 },
            ];

            for (const { tokens, expectedParseLength } of testCases) {
                const result = transpiler.transpile(tokens, 0, context);
                if (expectedParseLength === 0) {
                    expect(result).toBeUndefined();
                } else {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset).toBe(expectedParseLength, 'tokens.length = ' + tokens.length);
                }
            }
        });

        it('recursively transpiles its content', () => {
            const { transpiler, context } = createTestTranspiler();

            const start = new BlockBoundary('<<<');
            const end = new BlockBoundary('>>>');

            const testCases = [
                { tokens: [start], expectedRecursiveTranspileOffsets: [] },
                { tokens: [end, start], expectedRecursiveTranspileOffsets: [] },
                { tokens: [start, end], expectedRecursiveTranspileOffsets: [] },
                { tokens: [start, 0, end], expectedRecursiveTranspileOffsets: [1] },
                {
                    tokens: [start, 0, start, 0, end, start, start, 0, end, end, start, end, end],
                    expectedRecursiveTranspileOffsets: [1, 2, 3, 5, 6, 7, 10]
                },
            ];

            const rootTranspilerSpy = spyOn(context, 'transpile').and.callThrough();

            for (const { tokens, expectedRecursiveTranspileOffsets } of testCases) {
                rootTranspilerSpy.calls.reset();

                transpiler.transpile(tokens, 0, context);

                const actualRecursiveTranspileOffsets = rootTranspilerSpy.calls.all().map((call) => call.args[1]);

                expect(actualRecursiveTranspileOffsets).toEqual(expectedRecursiveTranspileOffsets);
            }
        });
    });
});
