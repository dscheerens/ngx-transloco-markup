import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult } from '../translation-markup-transpiler.model';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

/**
 * Transpiler that substitutes a fixed token. A subclass is responsible for rendering the actual markup that will be used instead of the
 * token. This is done by providing an implementation for the abstract `createRenderer` function.
 */
export abstract class SubstitutionTranspiler implements TranslationMarkupTranspiler {

    /** Object that holds the value of lazily initialized property. */
    private readonly deferred: { renderer?: TranslationMarkupRenderer } = {};

    /**
     * Creates a new `SubstitutionTranspiler` for the specified substitution token.
     */
    constructor(
        /** String representing the token that will be substituted with the output of the resulting renderer. */
        private readonly substitutionToken: string
    ) { }

    /** @inheritdoc */
    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        if (translation.startsWith(this.substitutionToken, offset)) {
            return {
                nextOffset: offset + this.substitutionToken.length,
                token: new SubstitutionToken(this.substitutionToken)
            };
        }

        return undefined;
    }

    /** @inheritdoc */
    public transpile(tokens: unknown[], offset: number): TranspileResult | undefined {
        const nextToken = tokens[offset];

        if (!(nextToken instanceof SubstitutionToken) || nextToken.token !== this.substitutionToken) {
            return undefined;
        }

        return {
            nextOffset: offset + 1,
            renderer: this.renderer
        };
    }

    /**
     * Creates the renderer responsible for generating the markup that will be substituted in place of the substitution token.
     */
    protected abstract createRenderer(): TranslationMarkupRenderer;

    /** Cached value of the result of the `createRenderer` function. */
    private get renderer(): TranslationMarkupRenderer {
        return this.deferred.renderer || (this.deferred.renderer = this.createRenderer());
    }

}

/**
 * Class for representing tokens that are to be replaced with the output of a specific markup renderer.
 */
export class SubstitutionToken {

    /**
     *  Creates a new `SubstitutionToken` instance for the specified token.
     */
    constructor(public readonly token: string) { }

}
