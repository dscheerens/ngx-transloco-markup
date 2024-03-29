import { ExternalLinkObjectLinkRenderer, StringLinkRenderer } from '../default-link-renderers';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

import {
  ContextualLinkSubstitutionTranspiler, ContextualLinkSubstitutionTranspilerOptions,
} from './contextual-link-substitution-transpiler';
import { SubstitutionToken } from './substitution-transpiler';

function createTestTranspiler(
    options: Partial<{
        token: string;
        label: ContextualLinkSubstitutionTranspilerOptions['label'];
        link: ContextualLinkSubstitutionTranspilerOptions['link'];
        linkRenderers: LinkRenderer<unknown>[];
    }> = {},
): ContextualLinkSubstitutionTranspiler {
    return new ContextualLinkSubstitutionTranspiler(
        options.token ?? '[*]',
        {
            label: options.label ?? { static: '???' },
            link: options.link ?? { static: 'test://example/' },
        },
        new TranslationMarkupRendererFactory(document),
        options.linkRenderers ?? [],
    );
}

describe('ContextualLinkSubstitutionTranspiler', () => {

    describe('tokenize function', () => {
        it('recognizes substitution tokens', () => {
            const testCases = [
                { token: '[x]', translation: 'x [X][x][x[]] x [x]', expectedTokenOffsets: [5, 16] },
                { token: '$xyz', translation: 'xyz$xy z$xzy$xyz$xyz', expectedTokenOffsets: [12, 16] },
                { token: '*', translation: '*!abc** ', expectedTokenOffsets: [0, 5, 6] },
            ];

            for (const { token, translation, expectedTokenOffsets } of testCases) {
                const transpiler = createTestTranspiler({ token });

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
            const transpiler = createTestTranspiler({ token: '{x}' });
            const tokens = ['{', 'x', '}', '{x}', true, false, 4, undefined, { token: '{x}' }, ['{', 'x', '}']];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(offset, context)).toBeUndefined();
            }
        });

        it('transpiles supported substitution tokens', () => {
            const transpiler = createTestTranspiler();
            const tokens = [
                0,
                new SubstitutionToken('[*]'),
                new SubstitutionToken('[*]'),
                0,
                new SubstitutionToken('[*]'),
                new SubstitutionToken('[?]'),
                new SubstitutionToken('[]'),
                new SubstitutionToken('[*]'),
            ];
            const context = new TranslationMarkupTranspilerContext(tokens, {}, [transpiler]);

            const expectedResults = [0, 1, 1, 0, 1, 0, 0, 1];

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

            const testCases = [
                { link: undefined, expectedLinkRenderer: undefined },
                { link: {}, expectedLinkRenderer: undefined },
                { link: [[{}]], expectedLinkRenderer: undefined },
                { link: 'test://my-link', expectedLinkRenderer: renderStringLinkSpy },
                { link: { url: 'test://another-link' }, expectedLinkRenderer: renderExternalLinkObjectLinkSpy },
            ];

            const renderLinkSpies = [renderStringLinkSpy, renderExternalLinkObjectLinkSpy];

            for (const testCase of testCases) {
                const transpiler = createTestTranspiler({
                    link: { static: testCase.link },
                    linkRenderers: [stringLinkRenderer, externalLinkObjectLinkRenderer],
                });
                const context = new TranslationMarkupTranspilerContext([new SubstitutionToken('[*]')], {}, [transpiler]);

                const renderLink = transpiler.transpile(0, context)!.renderer;

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
            const transpiler = createTestTranspiler({ label: { static: 'foo' } });
            const context = new TranslationMarkupTranspilerContext([new SubstitutionToken('[*]')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            expect(renderLink({}).textContent).toBe('foo');
        });

        it('supports parameter based labels', () => {
            const transpiler = createTestTranspiler({ label: { parameterKey: 'exampleLinkLabel' } });
            const context = new TranslationMarkupTranspilerContext([new SubstitutionToken('[*]')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            expect(renderLink({ exampleLinkLabel: 'bar' }).textContent).toBe('bar');
            expect(renderLink({}).textContent).toBe('');
        });

        it('supports dynamically resolved labels', () => {
            const transpiler = createTestTranspiler({ label: { resolve: (params) => `${params.a}${params.b}${params.c}` } });
            const context = new TranslationMarkupTranspilerContext([new SubstitutionToken('[*]')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            expect(renderLink({ a: 'b', b: 'a', c: 'z' }).textContent).toBe('baz');
        });

        it('supports static links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const transpiler = createTestTranspiler({ link: { static: 'test://foo' }, linkRenderers: [stringLinkRenderer] });
            const context = new TranslationMarkupTranspilerContext([new SubstitutionToken('[*]')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            renderLink({});
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://foo');
        });

        it('supports parameter based links', () => {
            const stringLinkRenderer = new StringLinkRenderer();
            const renderStringLinkSpy = spyOn(stringLinkRenderer, 'render');

            const transpiler = createTestTranspiler({ link: { parameterKey: 'exampleLink' }, linkRenderers: [stringLinkRenderer] });
            const context = new TranslationMarkupTranspilerContext([new SubstitutionToken('[*]')], {}, [transpiler]);

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

            const transpiler = createTestTranspiler({
                link: { resolve: (params) => `test://${params.example}` },
                linkRenderers: [stringLinkRenderer],
            });
            const context = new TranslationMarkupTranspilerContext([new SubstitutionToken('[*]')], {}, [transpiler]);

            const renderLink = transpiler.transpile(0, context)!.renderer;

            renderLink({ example: 'baz' });
            expect(renderStringLinkSpy).toHaveBeenCalled();
            expect(renderStringLinkSpy.calls.mostRecent().args[0]).toBe('test://baz');
        });

    });

});
