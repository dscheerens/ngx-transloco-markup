import { createRootTranspilerFunction } from '../create-translation-markup-renderer';
import { StringLinkRenderer, ExternalLinkObjectLinkRenderer } from '../default-link-renderers';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

import { SubstitutionLinkTranspiler, SubstitutionLinkTranspilerOptions } from './substitution-link-transpiler';
import { SubstitutionToken } from './substitution-transpiler';

function createTestTranspiler(
    options: Partial<{
        token: string;
        label: SubstitutionLinkTranspilerOptions['label'];
        link: SubstitutionLinkTranspilerOptions['link'];
        linkRenderers: LinkRenderer<unknown>[];
    }> = {}
): { transpiler: SubstitutionLinkTranspiler; context: TranslationMarkupTranspilerContext } {
    const transpiler = new SubstitutionLinkTranspiler(
        options.token || '[*]',
        {
            label: options.label || { static: '???' },
            link: options.link || { static: 'test://example/' }
        },
        new TranslationMarkupRendererFactory(document),
        options.linkRenderers || []
    );

    const context = {
        transpile: createRootTranspilerFunction([transpiler]),
        translation: {}
    };

    return { transpiler, context };
}

describe('SubstitutionLinkTranspiler', () => {

    describe('tokenize function', () => {
        it('recognizes substitution tokens', () => {
            const testCases = [
                { token: '[x]', translation: 'x [X][x][x[]] x [x]', expectedTokenOffsets: [5, 16] },
                { token: '$xyz', translation: 'xyz$xy z$xzy$xyz$xyz', expectedTokenOffsets: [12, 16] },
                { token: '*', translation: '*!abc** ', expectedTokenOffsets: [0, 5, 6] }
            ];

            for (const { token, translation, expectedTokenOffsets } of testCases) {
                const { transpiler } = createTestTranspiler({ token });

                for (const [offset] of translation.split('').entries()) {
                    const result = transpiler.tokenize(translation, offset);

                    if (expectedTokenOffsets.includes(offset)) {
                        expect(result).toBeDefined();
                        expect(result!.nextOffset).toBe(offset + token.length);
                        expect(result!.token).toBeInstanceOf(SubstitutionToken);
                        expect((result!.token as SubstitutionToken).token).toBe(token);
                    } else {
                        expect(result).toBeUndefined();
                    }
                }
            }
        });
    });

    describe('transpile function', () => {

        it('returns undefined for unknown tokens', () => {
            const { transpiler } = createTestTranspiler({ token: '{x}' });
            const tokens = ['{', 'x', '}', '{x}', true, false, 4, undefined, { token: '{x}' }, ['{', 'x', '}']];

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(tokens, offset)).toBeUndefined();
            }
        });

        it('transpiles supported substitution tokens', () => {
            const { transpiler } = createTestTranspiler();
            const tokens = [
                0,
                new SubstitutionToken('[*]'),
                new SubstitutionToken('[*]'),
                0,
                new SubstitutionToken('[*]'),
                new SubstitutionToken('[?]'),
                new SubstitutionToken('[]'),
                new SubstitutionToken('[*]')
            ];

            const expectedResults = [0, 1, 1, 0, 1, 0, 0, 1];

            for (const [offset, expectedResult] of expectedResults.entries()) {
                const result = transpiler.transpile(tokens, offset);

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

            const testCases = [
                { link: undefined, expectedLinkRenderer: undefined },
                { link: {}, expectedLinkRenderer: undefined },
                { link: [[{}]], expectedLinkRenderer: undefined },
                { link: 'test://my-link', expectedLinkRenderer: renderStringLinkSpy },
                { link: { url: 'test://another-link' }, expectedLinkRenderer: renderExternalLinkObjectLinkSpy }
            ];

            const renderLinkSpies = [renderStringLinkSpy, renderExternalLinkObjectLinkSpy];

            for (const testCase of testCases) {
                const { transpiler } = createTestTranspiler({
                    link: { static: testCase.link },
                    linkRenderers: [stringLinkRenderer, externalLinkObjectLinkRenderer]
                });

                const renderLink = transpiler.transpile([new SubstitutionToken('[*]')], 0)!.renderer;

                for (const renderLinkSpy of renderLinkSpies) {
                    renderLinkSpy.calls.reset();
                }

                renderLink({});

                for (const renderLinkSpy of renderLinkSpies) {
                    if (renderLinkSpy === testCase.expectedLinkRenderer) {
                        expect(renderLinkSpy).toHaveBeenCalled();
                    } else {
                        expect(renderLinkSpy).not.toHaveBeenCalled();
                    }
                }
            }
        });

        it('supports static labels', () => {
            const { transpiler } = createTestTranspiler({ label: { static: 'foo' } });

            const renderLink = transpiler.transpile([new SubstitutionToken('[*]')], 0)!.renderer;

            expect(renderLink({}).textContent).toBe('foo');
        });

        it('supports parameter based labels', () => {
            const { transpiler } = createTestTranspiler({ label: { parameterKey: 'exampleLinkLabel' } });

            const renderLink = transpiler.transpile([new SubstitutionToken('[*]')], 0)!.renderer;

            expect(renderLink({ exampleLinkLabel: 'bar' }).textContent).toBe('bar');
            expect(renderLink({ }).textContent).toBe('');
        });

        it('supports dynamically resolved labels', () => {
            const { transpiler } = createTestTranspiler({ label: { resolve: (params) => `${params.a}${params.b}${params.c}` } });

            const renderLink = transpiler.transpile([new SubstitutionToken('[*]')], 0)!.renderer;

            expect(renderLink({ a: 'b', b: 'a', c: 'z' }).textContent).toBe('baz');
        });

        it('supports static links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const { transpiler } = createTestTranspiler({ link: { static: 'test://foo' }, linkRenderers: [stringLinkRenderer] });

            const renderLink = transpiler.transpile([new SubstitutionToken('[*]')], 0)!.renderer;

            renderLink({});
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://foo');
        });

        it('supports parameter based links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const { transpiler } = createTestTranspiler({ link: { parameterKey: 'exampleLink' }, linkRenderers: [stringLinkRenderer] });

            const renderLink = transpiler.transpile([new SubstitutionToken('[*]')], 0)!.renderer;

            renderLink({ exampleLink: 'test://bar' });
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://bar');

            renderStringLinkSpy.calls.reset();

            renderLink({ });
            expect(renderStringLinkSpy).not.toHaveBeenCalled();
        });

        it('supports dynamically resolved links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const { transpiler } = createTestTranspiler({
                link: { resolve: (params) => `test://${params.example}` },
                linkRenderers: [stringLinkRenderer]
            });

            const renderLink = transpiler.transpile([new SubstitutionToken('[*]')], 0)!.renderer;

            renderLink({ example: 'baz' });
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://baz');
        });

    });

});
