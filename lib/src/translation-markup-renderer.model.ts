import { HashMap } from '@ngneat/transloco';

export type TranslationMarkupRenderer = (translationParameters: HashMap) => Node;
