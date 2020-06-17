import { HashMap, Translation } from '@ngneat/transloco';

import { selectFirstWhere } from './utils/iterable';
import { notUndefined } from './utils/predicates';
import { TranslationMarkupRenderer } from './translation-markup-renderer.model';
import {
    TranslationMarkupTranspiler,
    TranslationMarkupTranspilerFunction,
    TranspileResult,
    TranslationMarkupTranspilerContext
} from './translation-markup-transpiler.model';

/**
 * Creates a translation markup rendering function for the specified translation value.
 *
 * @param   translationValue Translation value containing markup tokens that is to be converted to a rendering function.
 * @param   transpilers      Ordered set of transpiler that are available for the conversion.
 * @param   translation      Translation dictionary containing the translation value.
 * @returns                  A rendering function that can render the translation given translation parameter to a specified target element.
 */
export function createTranslationMarkupRenderer(
    translationValue: string,
    transpilers: TranslationMarkupTranspiler[],
    translation: Translation
): (target: Element, translationParameters: HashMap) => void {
    const tokens = tokenize(translationValue, transpilers);
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

/**
 * Converts the given translation value into a sequence of tokens that can be parsed by the specified transpilers. Note that the order of
 * the transpilers is used to resolve conflicts when two or more transpilers can recognize a token at a specific location within the
 * translation value. Tokens are generated based on the first transpiler that is able to create token at a certain offset.
 *
 * @param   translationValue Translation value that is to be tokenized.
 * @param   transpilers      Ordered set transpilers used to convert the translation value into tokens.
 * @returns                  A sequence of tokens which can be parsed by the given transpilers and converted into markup renderers.
 */
export function tokenize(translationValue: string, transpilers: TranslationMarkupTranspiler[]): unknown[] {
    const tokens: unknown[] = [];
    let offset = 0;

    while (offset < translationValue.length) {
        const tokenizeResult = selectFirstWhere(transpilers, (transpiler) => transpiler.tokenize(translationValue, offset), notUndefined);

        if (tokenizeResult) {
            offset = tokenizeResult.nextOffset;
            tokens.push(tokenizeResult.token);
        } else {
            offset++;
        }
    }

    return tokens;
}

/**
 * Transpiles the given sequence of tokens using the provded transpilers into a `TranslationMarkupRenderer`.
 *
 * @param   tokens      Token sequence that is to be transpiled.
 * @param   transpilers Transpilers which are to be used to parse and convert the token sequence.
 * @param   translation Translation dictionary containing the translation value that is represented by the given tokens.
 * @returns             A `TranslationMarkupRenderer` that was constructed by the transpilers from the token sequence.
 */
export function transpile(
    tokens: unknown[],
    transpilers: TranslationMarkupTranspiler[],
    translation: Translation
): TranslationMarkupRenderer[] {
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

/**
 * Creates a transpiler function from the given set of transpilers. This function serves as the "root" transpiler used for recursive
 * transpilation. The resulting function iterates over the transpilers and returns the first successful transpilation result when invoked.
 *
 * @param   transpilers Set of transpilers from which the transpiler function is to be created.
 * @returns             A transpiler function that starts the transpilation process with the first transpiler that is able to parse the
 *                      token sequence at the specified offset.
 */
export function createRootTranspilerFunction(transpilers: TranslationMarkupTranspiler[]): TranslationMarkupTranspilerFunction {
    return function transpileFromRoot(
        tokens: unknown[],
        offset: number,
        context: TranslationMarkupTranspilerContext
    ): (TranspileResult | undefined) {
        return selectFirstWhere(transpilers, (transpiler) => transpiler.transpile(tokens, offset, context), notUndefined);
    };
}
