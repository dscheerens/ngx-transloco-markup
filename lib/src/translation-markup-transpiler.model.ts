import { Translation } from '@ngneat/transloco';

import { TranslationMarkupRenderer } from './translation-markup-renderer.model';
import { selectFirstWhere } from './utils/iterable';

/**
 * Interface for objects that can transpile translation values (including markup tokens) to a translation renderer.
 */
export interface TranslationMarkupTranspiler {

    /**
     * Attempts to recognize a token at the specified position for the given translation value. If a supported token is found, then the
     * token is returned in an arbitrary representation that suits the transpiler, including the offset at which the tokenization process
     * should continue. When no supported token is found `undefined` is returned.
     *
     * @param   translation Translation value that is to be tokenized.
     * @param   offset      Position where the token should be recognized
     * @returns             An object containing the token and next tokenization offset or `undefined` when no token is recognized.
     */
    tokenize(translation: string, offset: number): TokenizeResult | undefined;

    /**
     * Transpiles the token sequence (from the given context) starting at the specified offset. If the transpiler can parse the token
     * sequence it returns a `TranslationMarkupRenderer` and the offset of the next unparsed token. In case the transpiler is unable to
     * parse the token sequence at the specified offset `undefined` will be returned as result.
     *
     * @param   offset  Position within the token sequence where the transpilation should be performed.
     * @param   context Context that contains the token sequence that is to be transpiled and recursive transpilation support.
     * @returns         An object containing the offset of the next unparsed token and the `TranslationMarkupRenderer` that was created, or
     *                  `undefined` if the transpiler is unable to parse the token sequence.
     */
    transpile(offset: number, context: TranslationMarkupTranspilerContext): TranspileResult | undefined;
}

/**
 * Description of a successful tokenization result.
 */
export interface TokenizeResult {

    /** Offset at which the tokenization process should continue. */
    nextOffset: number;

    /** Token that was recognized. */
    token: unknown;
}

/**
 * Description of a successful transpilation result.
 */
export interface TranspileResult {
    /** Offset at which the transpilation process should continue. */
    nextOffset: number;

    /** Renderer that was created as result of the parsed translation value tokens. */
    renderer: TranslationMarkupRenderer;
}

/**
 * Outcome of multiple transpile calls executed sequentially over (part of) a token sequence.
 */
export interface SequentialTranspilationResult {

    /** Offset at which the transpilation process should continue. */
    nextOffset: number;

    /** Renderers that were created as result of the parsed translation value tokens. */
    renderers: TranslationMarkupRenderer[];
}

/**
 * Context used during the transpilation process.
 */
export class TranslationMarkupTranspilerContext {

    /**
     * Creates a new transpiler context for the specified token sequence and transpilers.
     */
    constructor(
        /** Sequence of tokens representing the translation value that should be transpiled. */
        public readonly tokens: unknown[],

        /** Translation dictionary containing the translation that is transpiled. */
        public readonly translation: Translation,

        /** Transpilers which are to be used to parse and convert the token sequence. */
        private readonly transpilers: TranslationMarkupTranspiler[]
    ) { }

    /**
     * Attempts to transpile the token sequence at the specified offset. This is done by finding the first transpiler from the set of
     * available transpilers that can successfully parse the token sequence.
     *
     * @param   offset Position within the token sequence where the transpilation should be performed.
     * @returns        Transpilation result of the first transpiler in the transpiler set that can parse the token sequence at the specified
     *                 offset. `undefined` is returned if none if the transpilers can transpile the token sequence.
     */
    public transpile(offset: number): TranspileResult | undefined {
        return selectFirstWhere(
            this.transpilers,
            (transpiler) => transpiler.transpile(offset, this),
            (result) => result !== undefined && result.nextOffset !== offset
        );
    }

    /**
     * Starts a sequential transpilation process that continues transpiling the token sequence until the end has been reached or when the
     * given `stopTranspiling` function returns `true`. The result is an object that contains the offset where the transpilation ended and
     * an array of the markup renderer functions that were created by the transpilers.
     *
     * @param   startOffset     Position within the token sequence where the transpilation process should be started.
     * @param   stopTranspiling Function that tells whether the sequential transpilation should stop at the specified offet and token at
     *                          that offset in the token sequence. The function must return `true` if the transpilation should stop.
     * @returns                 An object that describes the result of the sequential transpilation process: an array of the created
     *                          translation markup renderers (`renderers` property) and the offset where the process stopped (`nextOffset`).
     */
    public transpileUntil(
        startOffset: number,
        stopTranspiling: (token: unknown, offset: number) => boolean
    ): SequentialTranspilationResult {
        let offset = startOffset;

        const renderers: TranslationMarkupRenderer[] = [];

        while (offset < this.tokens.length && !stopTranspiling(this.tokens[offset], offset)) {

            const transpileResult = this.transpile(offset);

            if (transpileResult) {
                renderers.push(transpileResult.renderer);
                offset = transpileResult.nextOffset;
            } else {
                offset++;
            }
        }

        return {
            renderers,
            nextOffset: offset
        };
    }

}
