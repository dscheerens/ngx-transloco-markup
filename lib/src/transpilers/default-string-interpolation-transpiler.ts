import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TRANSLOCO_TRANSPILER, TranslocoTranspiler } from '@ngneat/transloco';

import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult, TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';

export interface InterpolationExpressionMatcher {
    matchExpression(source: string, offset: number): number | undefined;
}

export function defaultTranslationInterpolationExpressionMatcher(translation: string, offset: number): number | undefined {
    if (!translation.startsWith('{{', offset)) {
        return undefined;
    }

    const expressionEnd = translation.indexOf('}}', offset);

    return expressionEnd >= 2 ? expressionEnd + 2 - offset : undefined;
}

export function defaultTranslationInterpolationExpressionMatcherFactory(): InterpolationExpressionMatcher {
    return { matchExpression: defaultTranslationInterpolationExpressionMatcher };
}

export const TRANSLATION_INTERPOLATION_EXPRESSION_MATCHER = new InjectionToken<InterpolationExpressionMatcher>(
    'TRANSLATION_INTERPOLATION_EXPRESSION_MATCHER',
    {
        providedIn: 'root',
        factory: defaultTranslationInterpolationExpressionMatcherFactory
    }
);

@Injectable({ providedIn: 'root' })
export class DefaultStringInterpolationTranspiler implements TranslationMarkupTranspiler {

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory,
        @Inject(TRANSLOCO_TRANSPILER) private readonly translocoTranspiler: TranslocoTranspiler,
        @Inject(TRANSLATION_INTERPOLATION_EXPRESSION_MATCHER) private readonly expressionMatcher: InterpolationExpressionMatcher
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        const expressionLength = this.expressionMatcher.matchExpression(translation, offset);

        if (!expressionLength) {
            return undefined;
        }

        return {
            nextOffset: offset + expressionLength,
            token: new StringInterpolationSegment(translation.substring(offset, offset + expressionLength))
        };
    }

    public transpile(tokens: unknown[], offset: number, { translation }: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        const nextToken = tokens[offset];

        if (!(nextToken instanceof StringInterpolationSegment)) {
            return undefined;
        }

        const { interpolationExpression } = nextToken;

        return {
            nextOffset: offset + 1,
            renderer: this.rendererFactory.createTextRenderer(
                (translationParameters) => this.translocoTranspiler.transpile(interpolationExpression, translationParameters, translation)
            )
        };
    }

}

export class StringInterpolationSegment {
    constructor(public readonly interpolationExpression: string) { }
}
