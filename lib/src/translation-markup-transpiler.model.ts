import { Translation } from '@ngneat/transloco';

import { TranslationMarkupRenderer } from './translation-markup-renderer.model';

export interface TranslationMarkupTranspiler {
    transpile: TranslationMarkupTranspilerFunction;
    tokenize(translation: string, offset: number): TokenizeResult | undefined;
}

export interface TokenizeResult {
    nextOffset: number;
    token: unknown;
}

export interface TranspileResult {
    nextOffset: number;
    renderer: TranslationMarkupRenderer;
}

export type TranslationMarkupTranspilerFunction =
    (tokens: unknown[], offset: number, context: TranslationMarkupTranspilerContext) => (TranspileResult | undefined);

export interface TranslationMarkupTranspilerContext {
    transpile: TranslationMarkupTranspilerFunction;
    translation: Translation;
}
