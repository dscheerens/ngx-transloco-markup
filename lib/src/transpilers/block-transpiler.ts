import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult, TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

export abstract class BlockTranspiler implements TranslationMarkupTranspiler {

    constructor(
        private readonly blockStartToken: string,
        private readonly blockEndToken: string
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        function recognize(token: string): TokenizeResult | undefined {
            return (
                translation.substring(offset, offset + token.length) === token
                ? { nextOffset: offset + token.length, token: new BlockBoundary(token) }
                : undefined
            );
        }

        return recognize(this.blockStartToken) || recognize(this.blockEndToken);
    }

    public transpile(tokens: unknown[], start: number, context: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        const nextToken = tokens[start];

        if (!this.isOpenTag(nextToken)) {
            return undefined;
        }

        const childRenderers: TranslationMarkupRenderer[] = [];
        let offset = start + 1;
        while (offset < tokens.length && !this.isCloseTag(tokens[offset])) {
            const transpileResult = context.transpile(tokens, offset, context);

            if (transpileResult) {
                childRenderers.push(transpileResult.renderer);
                offset = transpileResult.nextOffset;
            } else {
                offset++;
            }

        }

        return {
            nextOffset: offset + (offset < tokens.length ? 1 : 0),
            renderer: this.createRenderer(childRenderers)
        };
    }

    protected abstract createRenderer(childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer;

    private isOpenTag(token: unknown): token is BlockBoundary {
        return token instanceof BlockBoundary && token.token === this.blockStartToken;
    }

    private isCloseTag(token: unknown): token is BlockBoundary {
        return token instanceof BlockBoundary && token.token === this.blockEndToken;
    }
}

export class BlockBoundary {
    constructor(public readonly token: string) { }
}
