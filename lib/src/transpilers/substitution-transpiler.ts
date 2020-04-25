import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult } from '../translation-markup-transpiler.model';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

export abstract class SubstitutionTranspiler implements TranslationMarkupTranspiler {

    private readonly deferred: { renderer?: TranslationMarkupRenderer } = {};

    constructor(
        private readonly substitutionToken: string
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        if (translation.startsWith(this.substitutionToken, offset)) {
            return {
                nextOffset: offset + this.substitutionToken.length,
                token: new SubstitutionToken(this.substitutionToken)
            };
        }

        return undefined;
    }

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

    protected abstract createRenderer(): TranslationMarkupRenderer;

    private get renderer(): TranslationMarkupRenderer {
        return this.deferred.renderer || (this.deferred.renderer = this.createRenderer());
    }

}

class SubstitutionToken {
    constructor(public readonly token: string) { }
}
