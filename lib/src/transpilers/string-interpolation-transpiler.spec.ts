import { TranslocoTranspiler } from '@ngneat/transloco';

import { createRootTranspilerFunction } from '../create-translation-markup-renderer';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

import {
    InterpolationExpressionMatcher,
    StringInterpolationSegment,
    StringInterpolationTranspiler,
    defaultTranslationInterpolationExpressionMatcherFactory
} from './string-interpolation-transpiler';

class TestTranslocoTranspiler implements TranslocoTranspiler {
    public transpile(value: any): any {
        return value;
    }
}

function createTestTranspiler(
    interpolationExpressionMatcher?: InterpolationExpressionMatcher
): { transpiler: StringInterpolationTranspiler; context: TranslationMarkupTranspilerContext; translocoTranspiler: TranslocoTranspiler } {

    const translocoTranspiler = new TestTranslocoTranspiler();

    const transpiler = new StringInterpolationTranspiler(
        new TranslationMarkupRendererFactory(document),
        translocoTranspiler,
        interpolationExpressionMatcher || defaultTranslationInterpolationExpressionMatcherFactory()
    );

    const context = {
        transpile: createRootTranspilerFunction([transpiler]),
        translation: {}
    };

    return { transpiler, context, translocoTranspiler };
}

describe('StringInterpolationTranspiler', () => {
    describe('tokenize function', () => {
        it('recognizes default Transloco interpolation expressions', () => {
            const { transpiler } = createTestTranspiler();

            const translation = 'abc {{ def.ghi }} jkl {{ mnn }} {{ incomplete';

            const testCases = [
                { offset: 0, expectedToken: undefined },
                { offset: 1, expectedToken: undefined },
                { offset: 4, expectedToken: '{{ def.ghi }}' },
                { offset: 5, expectedToken: undefined },
                { offset: 22, expectedToken: '{{ mnn }}' },
                { offset: 23, expectedToken: undefined },
                { offset: 32, expectedToken: undefined }
            ];

            for (const { offset, expectedToken } of testCases) {
                const result = transpiler.tokenize(translation, offset);

                if (expectedToken) {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset).toBe(offset + expectedToken.length);
                    expect(result!.token instanceof StringInterpolationSegment).toBe(true);
                    expect((result!.token as StringInterpolationSegment).interpolationExpression).toBe(expectedToken);
                } else {
                    expect(result).toBeUndefined();
                }
            }
        });

        it('supports recognition of custom expressions', () => {
            const { transpiler } = createTestTranspiler({ matchExpression: (value: string, offset: number) => {
                if (!value.startsWith('$[', offset)) {
                    return undefined;
                }

                const expressionEnd = value.indexOf(']', offset);

                return expressionEnd >= 2 ? expressionEnd + 1 - offset : undefined;
            }});

            const translation = 'abc {{ def.ghi }} jkl $[ mnn ]';

            const testCases = [
                { offset: 0, expectedToken: undefined },
                { offset: 4, expectedToken: undefined },
                { offset: 21, expectedToken: undefined },
                { offset: 22, expectedToken: '$[ mnn ]' },
                { offset: 23, expectedToken: undefined }
            ];

            for (const { offset, expectedToken } of testCases) {
                const result = transpiler.tokenize(translation, offset);

                if (expectedToken) {
                    expect(result).toBeDefined();
                    expect(result!.nextOffset).toBe(offset + expectedToken.length);
                    expect(result!.token instanceof StringInterpolationSegment).toBe(true);
                    expect((result!.token as StringInterpolationSegment).interpolationExpression).toBe(expectedToken);
                } else {
                    expect(result).toBeUndefined();
                }
            }
        });
    });

    describe('transpile function', () => {
        it('returns undefined for unknown tokens', () => {
            const { transpiler, context } = createTestTranspiler();
            const tokens = ['a', 'b', '{{', true, false, 4, undefined, { token: '{{' }, '}}'];

            for (const [offset] of tokens.entries()) {
                expect(transpiler.transpile(tokens, offset, context)).toBeUndefined();
            }
        });

        it('transpiles interpolation expressions', () => {
            const { transpiler, context } = createTestTranspiler();
            const tokens = [
                new StringInterpolationSegment('{{ a }}'),
                new StringInterpolationSegment('{{ bcd.efg }}'),
                new StringInterpolationSegment('{{ xyz }}')
            ];

            for (const [offset] of tokens.entries()) {
                const result = transpiler.transpile(tokens, offset, context);
                expect(result).toBeDefined();
                expect(result!.nextOffset).toBeDefined(offset + 1);
            }
        });

        it('uses the transloco transpiler to expand interpolation expressions', () => {
            const { transpiler, context, translocoTranspiler } = createTestTranspiler();

            const tranpileResult = transpiler.transpile([new StringInterpolationSegment('{{ a }}')], 0, context);

            const transpileSpy = spyOn(translocoTranspiler, 'transpile').and.returnValue('(expanded)');

            const renderTranslation = tranpileResult!.renderer;

            const renderResult = renderTranslation({});

            expect(transpileSpy).toHaveBeenCalled();
            expect(transpileSpy.calls.argsFor(0)[0]).toBe('{{ a }}');

            expect(renderResult).toBeInstanceOf(Text);
            expect((renderResult as Text).textContent).toBe('(expanded)');
        });
    });
});
