import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult, TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

/**
 * Base class for transpilers that can transpile contents of a block that is bounded by specific start and end tokens.
 */
export abstract class BlockTranspiler implements TranslationMarkupTranspiler {

    /**
     * Creates a new `BlockTranspiler` for the specified boundary tokens.
     */
    constructor(
        /** String that defines the start token for the block. */
        private readonly blockStartToken: string,

        /** String that defines the end token for the block. */
        private readonly blockEndToken: string
    ) { }

    /** @inheritdoc */
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

    /** @inheritdoc */
    public transpile(tokens: unknown[], start: number, context: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        const nextToken = tokens[start];

        if (!this.isStartTag(nextToken)) {
            return undefined;
        }

        const childRenderers: TranslationMarkupRenderer[] = [];
        let offset = start + 1;
        while (offset < tokens.length && !this.isEndTag(tokens[offset])) {
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

    /**
     * Creates the block rendering function for the given transpiled contents of the block.
     *
     * @param   childRenderers Contents of the block that was transpiled to a sequence of child renderers.
     * @returns                A renderer that combines the given child renderers, representing the contents of the block, into a single
     *                         rendering function.
     */
    protected abstract createRenderer(childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer;

    /**
     * Checks whether the specified token represents the start boundary of a block that can be transpiled.
     *
     * @param   token Token which is to be checked.
     * @returns       `true` if the token is a start boundary of the block.
     */
    private isStartTag(token: unknown): token is BlockBoundary {
        return token instanceof BlockBoundary && token.token === this.blockStartToken;
    }

    /**
     * Checks whether the specified token represents the end boundary of a block that can be transpiled.
     *
     * @param   token Token which is to be checked.
     * @returns       `true` if the token is a end boundary of the block.
     */
    private isEndTag(token: unknown): token is BlockBoundary {
        return token instanceof BlockBoundary && token.token === this.blockEndToken;
    }
}

/**
 * Class used for representing the boundary tokens of a block.
 */
export class BlockBoundary {
    constructor(public readonly token: string) { }
}
