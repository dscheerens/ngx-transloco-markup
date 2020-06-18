import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TRANSLOCO_TRANSPILER, TranslocoTranspiler } from '@ngneat/transloco';

import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import {
    TokenizeResult,
    TranslationMarkupTranspiler,
    TranspileResult,
    TranslationMarkupTranspilerContext
} from '../translation-markup-transpiler.model';

/**
 * Interface for objects that can detect interpolation expressions.
 */
export interface InterpolationExpressionMatcher {

    /**
     * Checks whether an interpolation expression is found in the given string at the specified offset.
     *
     * @param   source String where the interpolation expression might be found.
     * @param   offset Position within the string which should be checked for the presence of an interpolation expression.
     * @returns        Length of the interpolation expression in number of characters or `undefined` if no expression was found.
     */
    matchExpression(source: string, offset: number): number | undefined;

}

/**
 * Interpolation expression matcher for the default syntax of Transloco interpolation expressions: `{{...}}`.
 *
 * @param   translationValue String where the interpolation expression might be found.
 * @param   offset           Position within the string which should be checked for the presence of an interpolation expression.
 * @returns                  The length of the interpolation expression in number of characters or `undefined` if none was found.
 */
export function defaultTranslationInterpolationExpressionMatcher(translationValue: string, offset: number): number | undefined {
    if (!translationValue.startsWith('{{', offset)) {
        return undefined;
    }

    const expressionEnd = translationValue.indexOf('}}', offset);

    return expressionEnd >= 2 ? expressionEnd + 2 - offset : undefined;
}

/**
 * Factory function for the `defaultTranslationInterpolationExpressionMatcher`. Used for the `TRANSLATION_INTERPOLATION_EXPRESSION_MATCHER`
 * injection token.
 */
export function defaultTranslationInterpolationExpressionMatcherFactory(): InterpolationExpressionMatcher {
    return { matchExpression: defaultTranslationInterpolationExpressionMatcher };
}

/**
 * Injection token that is used for defining the provider for the `InterpolationExpressionMatcher`, which is needed by the
 * `StringInterpolationTranspiler`.
 */
export const TRANSLATION_INTERPOLATION_EXPRESSION_MATCHER = new InjectionToken<InterpolationExpressionMatcher>(
    'TRANSLATION_INTERPOLATION_EXPRESSION_MATCHER',
    {
        providedIn: 'root',
        factory: defaultTranslationInterpolationExpressionMatcherFactory
    }
);

/**
 * Markup transpiler that supports interpolation expressions, and which creates a renderer that expands the expression to string using the
 * `TranslocoTranspiler`. Since the `TranslocoTranspiler` can be overridden with a custom implementation that uses a different syntax this
 * class uses a (configurable) `InterpolationExpressionMatcher`. This expression matcher can be overridden with a different implementation
 * that supports the syntax of a custom `TranslocoTranspiler`.
 */
@Injectable({ providedIn: 'root' })
export class StringInterpolationTranspiler implements TranslationMarkupTranspiler {

    /**
     * Creates a new `StringInterpolationTranspiler` that uses the specified renderer factory, Transloco transpiler and expression matcher.
     */
    constructor(
        /** Renderer factory which will be used for rendering the text nodes containing the result of interpolation expressions. */
        private readonly rendererFactory: TranslationMarkupRendererFactory,

        /** The Transloco transpiler that will be used for evaluating interpolation expressions. */
        @Inject(TRANSLOCO_TRANSPILER) private readonly translocoTranspiler: TranslocoTranspiler,

        /** Matcher that can find interpolation expressions in a translation value which are supported by the Transloco transpiler. */
        @Inject(TRANSLATION_INTERPOLATION_EXPRESSION_MATCHER) private readonly expressionMatcher: InterpolationExpressionMatcher
    ) { }

    /** @inheritdoc */
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

    /** @inheritdoc */
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

/**
 * Token class for interpolation expressions.
 */
export class StringInterpolationSegment {

    /**
     *  Creates a new `StringInterpolationSegment` for the specified expression.
     */
    constructor(public readonly interpolationExpression: string) { }

}
