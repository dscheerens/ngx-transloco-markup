import { ExternalLinkObjectLinkRenderer, StringLinkRenderer } from '../default-link-renderers';
import { LinkRenderer } from '../link-renderer.model';
import { ResolveLinkSpecification } from '../models/resolve-link-specification.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';
import { asArray } from '../utils/array';

import { BlockBoundary } from './block-transpiler';
import { ContextualLinkBlockTranspiler } from './contextual-link-block-transpiler';

function createTestTranspiler(
    startToken: string,
    endToken: string,
    linkRenderers?: LinkRenderer<unknown> | LinkRenderer<unknown>[],
    link?: ResolveLinkSpecification,
): ContextualLinkBlockTranspiler {
    return new ContextualLinkBlockTranspiler(
        startToken,
        endToken,
        link ?? { static: 'test://link.com' },
        new TranslationMarkupRendererFactory(document),
        asArray(linkRenderers ?? []),
    );
}

describe('ContextualLinkBlockTranspiler', () => {
    describe('tokenize function', () => {
        it('recognizes contextual link blocks in translations', () => {
            const transpiler = createTestTranspiler('<recipe-link>', '</recipe-link>');

            const translation = 'Best <recipe-link>cake recipe</recipe-link> ever!';

            const expectedTokens = [
                { offset: 5, lenght: 13, value: '<recipe-link>' },
                { offset: 29, lenght: 14, value: '</recipe-link>' },
            ] as const;

            for (const [offset] of translation.split('').entries()) {
                const result = transpiler.tokenize(translation, offset);

                const expected = expectedTokens.find((expectedToken) => expectedToken.offset === offset);

                if (expected) {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset).toBe(offset + expected.lenght);
                    expect(result!.token).toBeInstanceOf(BlockBoundary);
                    expect((result!.token as BlockBoundary).token).toBe(expected.value);
                } else {
                    expect(result).toBeUndefined();
                }
            }
        });
    });

    describe('transpile function', () => {
        it('returns undefined for unknown tokens', () => {
            const transpiler = createTestTranspiler('{link:start}', '{link:end}');
            const tokens = [0, 'a', '<a>', '[link]', '{link:start}', '{link:end}', ['{link}'], true, false, null, undefined, {}];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(offset, context)).toBeUndefined();
            }
        });

        it('returns a link renderer when transpiling supported token sequences', () => {
            const transpiler = createTestTranspiler('<start>', '<end>');
            const tokens = [
                0,
                new BlockBoundary('<start>'),
                0,
                new BlockBoundary('<start>'),
                new BlockBoundary('<end>'),
                new BlockBoundary('<end>'),
                0,
                new BlockBoundary('<start>'),
                0,
                new BlockBoundary('<end>'),
            ];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            const expectedResults = [0, 5, 0, 2, 0, 0, 0, 3, 0, 0];

            for (const [offset, expectedResult] of expectedResults.entries()) {
                const result = transpiler.transpile(offset, context);

                if (expectedResult === 0) {
                    expect(result).toBeUndefined();
                } else {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset).toBe(offset + expectedResult);
                    expect(result!.renderer).toBeDefined();
                }
            }
        });

        it('uses the provided link renderers to render the links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const externalLinkObjectLinkRenderer = new ExternalLinkObjectLinkRenderer();

            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');
            const renderExternalLinkObjectLinkSpy = spyOn(externalLinkObjectLinkRenderer, 'render');

            const transpiler = createTestTranspiler(
                '[',
                ']',
                [stringLinkRenderer, externalLinkObjectLinkRenderer],
                { parameterKey: 'testLink' },
            );

            const context = new TranslationMarkupTranspilerContext([new BlockBoundary('['), new BlockBoundary(']')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            expect(renderStringLinkSpy).not.toHaveBeenCalled();
            expect(renderExternalLinkObjectLinkSpy).not.toHaveBeenCalled();

            renderLink({ testLink: 'https://www.example.com/' });

            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderExternalLinkObjectLinkSpy).not.toHaveBeenCalled();

            renderStringLinkSpy.calls.reset();
            renderExternalLinkObjectLinkSpy.calls.reset();

            renderLink({ testLink: { url: 'https://www.example.com/' } });

            expect(renderStringLinkSpy).not.toHaveBeenCalled();
            expect(renderExternalLinkObjectLinkSpy).toHaveBeenCalled();

            renderStringLinkSpy.calls.reset();
            renderExternalLinkObjectLinkSpy.calls.reset();

            renderLink({ testLink: { thisIs: 'not a supported link' } });

            expect(renderStringLinkSpy).not.toHaveBeenCalled();
            expect(renderExternalLinkObjectLinkSpy).not.toHaveBeenCalled();
        });

        it('supports static links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const transpiler = createTestTranspiler('[', ']', [stringLinkRenderer], { static: 'test://foo' });
            const context = new TranslationMarkupTranspilerContext([new BlockBoundary('['), new BlockBoundary(']')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            renderLink({});
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://foo');
        });

        it('supports parameter based links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const transpiler = createTestTranspiler('[', ']', [stringLinkRenderer], { parameterKey: 'exampleLink' });
            const context = new TranslationMarkupTranspilerContext([new BlockBoundary('['), new BlockBoundary(']')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            renderLink({ exampleLink: 'test://bar' });
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://bar');

            renderStringLinkSpy.calls.reset();

            renderLink({});
            expect(renderStringLinkSpy).not.toHaveBeenCalled();
        });

        it('supports dynamically resolved links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const transpiler = createTestTranspiler(
                '[',
                ']',
                [stringLinkRenderer],
                { resolve: (params) => `test://${params.example}` },
            );
            const context = new TranslationMarkupTranspilerContext([new BlockBoundary('['), new BlockBoundary(']')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            renderLink({ example: 'baz' });
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://baz');
        });
    });
});
