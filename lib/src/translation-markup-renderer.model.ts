import { HashMap } from '@ngneat/transloco';

export type TranslationMarkupRenderer<T extends Node = Node> = (translationParameters: HashMap) => T;
