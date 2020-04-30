import { HashMap, Translation } from '@ngneat/transloco';

import { selectFirstWhere } from './utils/iterable';
import { notUndefined } from './utils/predicates';
import { TranslationMarkupRenderer } from './translation-markup-renderer.model';
import { TranslationMarkupTranspiler, TranslationMarkupTranspilerFunction, TranspileResult, TranslationMarkupTranspilerContext } from './translation-markup-transpiler.model';

export function createTranslationMarkupRenderer(
    translationText: string,
    transpilers: TranslationMarkupTranspiler[],
    translation: Translation
): (target: Element, translationParameters: HashMap) => void {
    const tokens = tokenize(translationText, transpilers);
    const renderers = transpile(tokens, transpilers, translation);

    return function renderTranslation(target: Element, translationParams: HashMap): void {
        while (target.lastChild) {
            target.removeChild(target.lastChild);
        }

        for (const render of renderers) {
            target.appendChild(render(translationParams));
        }
    };
}

function tokenize(translation: string, transpilers: TranslationMarkupTranspiler[]): unknown[] {
    const tokens: unknown[] = [];
    let offset = 0;

    while (offset < translation.length) {
        const tokenizeResult = selectFirstWhere(transpilers, (transpiler) => transpiler.tokenize(translation, offset), notUndefined);

        if (tokenizeResult) {
            offset = tokenizeResult.nextOffset;
            tokens.push(tokenizeResult.token);
        } else {
            offset++;
        }
    }

    return tokens;
}

function transpile(tokens: unknown[], transpilers: TranslationMarkupTranspiler[], translation: Translation): TranslationMarkupRenderer[] {
    const transpilerContext = {
        transpile: createRootTranspilerFunction(transpilers),
        translation
    };

    const renderers: TranslationMarkupRenderer[] = [];
    let offset = 0;

    while (offset < tokens.length) {
        const transpileResult = transpilerContext.transpile(tokens, offset, transpilerContext);

        if (transpileResult) {
            offset = transpileResult.nextOffset;
            renderers.push(transpileResult.renderer);
        } else {
            offset++;
        }

    }

    return renderers;
}

function createRootTranspilerFunction(transpilers: TranslationMarkupTranspiler[]): TranslationMarkupTranspilerFunction {
    return function transpileFromRoot(
        tokens: unknown[],
        offset: number,
        context: TranslationMarkupTranspilerContext
    ): (TranspileResult | undefined) {
        return selectFirstWhere(transpilers, (transpiler) => transpiler.transpile(tokens, offset, context), notUndefined);
    };
}
