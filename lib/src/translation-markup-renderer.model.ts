import { HashMap } from '@jsverse/transloco';

/** Function signature for translation markup renderers, that can create a DOM node hierachy given the translation parameters. */
export type TranslationMarkupRenderer<T extends Node = Node> = (translationParameters: HashMap) => T;
