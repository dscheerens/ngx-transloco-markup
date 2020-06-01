import { createRootTranspilerFunction } from '../create-translation-markup-renderer';
import { StringLinkRenderer, ExternalLinkObjectLinkRenderer } from '../default-link-renderers';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

import { LINK_END, LinkStart, LinkTranspiler } from './link-transpiler';

function createTestTranspiler(
    linkRenderers?: LinkRenderer<unknown> | LinkRenderer<unknown>[]
): { transpiler: LinkTranspiler; context: TranslationMarkupTranspilerContext } {
    const transpiler = new LinkTranspiler(new TranslationMarkupRendererFactory(document), linkRenderers || null);
    const context = {
        transpile: createRootTranspilerFunction([transpiler]),
        translation: {}
    };

    return { transpiler, context };
}

describe('StringInterpolationTranspiler', () => {
    describe('tokenize function', () => {
        it('recognizes link blocks in translations', () => {
            const { transpiler } = createTestTranspiler();

            const translation = 'Click [link:cookieLink]here[/link] for cookies! Or [link:bakingCourseLink]learn[/link] to make your own.';

            const expectedTokens = [
                { offset: 6,  lenght: 17, type: 'start', parameterKey: 'cookieLink' },
                { offset: 27, lenght: 7,  type: 'end' },
                { offset: 51, lenght: 23, type: 'start', parameterKey: 'bakingCourseLink' },
                { offset: 79, lenght: 7,  type: 'end' }
            ] as const;

            for (const [offset] of translation.split('').entries()) {
                const result = transpiler.tokenize(translation, offset);

                const expected = expectedTokens.find((expectedToken) => expectedToken.offset === offset);

                if (expected) {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset).toBe(offset + expected.lenght);
                    if (expected.type === 'start') {
                        expect(result!.token).toBeInstanceOf(LinkStart);
                        expect((result!.token as LinkStart).parameterKey).toBe(expected.parameterKey);
                    } else {
                        expect(result!.token).toBe(LINK_END);
                    }
                } else {
                    expect(result).toBeUndefined();
                }
            }
        });

        it('ignores invalid start and end tags', () => {
            const { transpiler } = createTestTranspiler();

            const translation = 'Don\'t [/link you hate it [link:when';

            for (const [offset] of translation.split('').entries()) {
                const result = transpiler.tokenize(translation, offset);

                expect(result).toBeUndefined();
            }
        });
    });

    describe('transpile function', () => {
        it('returns undefined for unknown tokens', () => {
            const { transpiler, context } = createTestTranspiler();
            const tokens = [0, 'a', '<a>', '[link:abc]', ['link:abc'], true, false, null, undefined, {}];

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(tokens, offset, context)).toBeUndefined();
            }
        });

        it('returns a link renderer when transpiling supported token sequences', () => {
            const { transpiler, context } = createTestTranspiler();
            const tokens = [0, new LinkStart('abc'), 0, new LinkStart('def'), LINK_END, LINK_END, 0, new LinkStart('efg'), 0, LINK_END ];

            const expectedResults = [0, 5, 0, 2, 0, 0, 0, 3, 0, 0];

            for (const [offset, expectedResult] of expectedResults.entries()) {
                const result = transpiler.transpile(tokens, offset, context);

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

            const { transpiler, context } = createTestTranspiler([stringLinkRenderer, externalLinkObjectLinkRenderer]);

            const renderLink = transpiler.transpile([new LinkStart('testLink'), LINK_END], 0, context)!.renderer;

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
    });
});
