import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { HashMap } from '@ngneat/transloco';

import { TranslationMarkupRenderer } from './translation-markup-renderer.model';

@Injectable({ providedIn: 'root' })
export class TranslationMarkupRendererFactory {

    private readonly document: Document;

    constructor(
        @Inject(DOCUMENT) document: any
    ) {
        this.document = document;
    }

    public createTextRenderer(text: string | ((translationParameters: HashMap) => string)): TranslationMarkupRenderer {
        const document = this.document;

        return function renderText(translationParameters: HashMap): Node {
            return document.createTextNode(typeof text === 'string' ? text : text(translationParameters));
        };
    }

    public createElementRenderer(elementTag: string, childRenderers?: TranslationMarkupRenderer[]): TranslationMarkupRenderer {
        const document = this.document;

        return function renderElement(translationParameters: HashMap): Element {
            const element = document.createElement(elementTag);

            for (const renderChild of childRenderers || []) {
                element.appendChild(renderChild(translationParameters));
            }

            return element;
        };
    }

}
