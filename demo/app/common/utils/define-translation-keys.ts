
const TRANSLATION_KEY_PLACEHOLDER = Symbol('TRANSLATION_KEY_PLACEHOLDER');
type TranslationKeyPlaceholder = typeof TRANSLATION_KEY_PLACEHOLDER;

export interface TranslationStructure {
    [key: string]: TranslationStructure | TranslationKeyPlaceholder;
}

export type TranslationKeysOf<T extends TranslationStructure> = {
    [P in keyof T]: T[P] extends TranslationStructure ? TranslationKeysOf<T[P]> : string
};

export function defineTranslationKeys<T extends TranslationStructure>(
    translationStructure: (t: TranslationKeyPlaceholder) => T
): TranslationKeysOf<T> {
    return generateTranslationKeys(translationStructure(TRANSLATION_KEY_PLACEHOLDER));
}

function generateTranslationKeys<U extends TranslationStructure>(structure: U, prefix?: string): TranslationKeysOf<U> {
    return Object.keys(structure).reduce<Partial<TranslationKeysOf<U>>>(
        (keys, key) => {
            const value = structure[key];
            const path = prefix === undefined ? key : `${prefix}.${key}`;

            return {
                ...keys,
                [key]: value === TRANSLATION_KEY_PLACEHOLDER ? path : generateTranslationKeys(value, path)
            };
        },
        {}
    ) as TranslationKeysOf<U>;
}
