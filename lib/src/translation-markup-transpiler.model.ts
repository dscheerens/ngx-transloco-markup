import { Translation } from '@ngneat/transloco';

import { TranslationMarkupRenderer } from './translation-markup-renderer.model';

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
     * Transpiles the token sequence starting at the specified offset. If the transpiler can parse the token sequence it returns a
     * `TranslationMarkupRenderer` and the offset of the next unparsed token. In case the transpiler is unable to parse the token sequence
     * at the specified offset `undefined` will be returned as result.
     *
     * @param tokens  Sequence of tokens representing the translation value that should be transpiled.
     * @param offset  Position within the token sequence where the transpilation should be performed.
     * @param context Additional context of the transpilation process.
     */
    transpile(tokens: unknown[], offset: number, context: TranslationMarkupTranspilerContext): (TranspileResult | undefined);
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
 * Signature for functions that can transpile a sequence of translation value tokens to a markup renderer.
 */
export type TranslationMarkupTranspilerFunction =
    (tokens: unknown[], offset: number, context: TranslationMarkupTranspilerContext) => (TranspileResult | undefined);

/**
 * Context used during the transpilation process.
 */
export interface TranslationMarkupTranspilerContext {
    /** Transpiler function that starts the transpilation process. Used to support recursive transpilation. */
    transpile: TranslationMarkupTranspilerFunction;

    /** Translation dictionary containing the translation that is transpiled. */
    translation: Translation;
}
