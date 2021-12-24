import { Injectable, Optional, Inject } from '@angular/core';
import { HashMap } from '@ngneat/transloco';

import { asArray } from '../utils/array';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import {
    TokenizeResult,
    TranslationMarkupTranspiler,
    TranspileResult,
    TranslationMarkupTranspilerContext,
} from '../translation-markup-transpiler.model';

/**
 * A transpiler that can be used to parse links in a translation value and convert those to a renderer that generates an HTML anchor
 * element. Supports the following syntax: `[link:parameterKey]...[/link]`, where `parameterKey` should be substituted with the actual key
 * of the parameter that stores the target link. Contents between the opening and closing tags will be recursively transpiled.
 */
@Injectable()
export class LinkTranspiler implements TranslationMarkupTranspiler {

    /** Set of link renderers that are used to apply the link model from the translation parameter to the anchor element. */
    private readonly linkRenderers: LinkRenderer<unknown>[];

    /**
     * Creates a new `LinkTranspiler` that uses the specified renderer factory for creating the HTML anchor element (`<a>`) and which
     * delegates the rendering of link models to the given set of link renderers.
     */
    constructor(
        /** Renderer factory which will be used for creating the HTML anchor element renderer. */
        private readonly rendererFactory: TranslationMarkupRendererFactory,

        /** Set of link renderers that are used to apply the link model from the translation parameter to the anchor element. */
        @Inject(LinkRenderer) @Optional() linkRenderers: LinkRenderer<unknown> | LinkRenderer<unknown>[] | null,
    ) {
        this.linkRenderers = !linkRenderers ? [] : asArray(linkRenderers);
    }

    /** @inheritdoc */
    public tokenize(translation: string, offset: number): TokenizeResult | undefined {

        if (translation.startsWith(LINK_END_TOKEN, offset)) {
            return {
                nextOffset: offset + LINK_END_TOKEN.length,
                token: LINK_END,
            };
        }

        if (!translation.startsWith(LINK_START_TOKEN, offset)) {
            return undefined;
        }

        const end = translation.indexOf(']', offset + LINK_START_TOKEN.length);

        if (end < 0) {
            return undefined;
        }

        const parameterKey = translation.substring(offset + LINK_START_TOKEN.length, end);

        return {
            nextOffset: end + 1,
            token: new LinkStart(parameterKey),
        };
    }

    /** @inheritdoc */
    public transpile(start: number, context: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        const nextToken = context.tokens[start];

        if (!(nextToken instanceof LinkStart)) {
            return undefined;
        }

        const { nextOffset, renderers } = context.transpileUntil(start + 1, (token) => token === LINK_END);

        return {
            nextOffset: Math.min(nextOffset + 1, context.tokens.length),
            renderer: this.createRenderer(nextToken.parameterKey, renderers),
        };
    }

    /**
     * Creates a renderer that generates an HTML anchor tag and applies the link model stored in the specified translation parameter.
     *
     * @param   parameterKey   Key that identifies the translation parameter containing the link model.
     * @param   childRenderers Transpiled content of the link.
     * @returns                A markup renderer that creates an HTML representation of the link.
     */
    protected createRenderer(parameterKey: string, childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer {
        const anchorRenderer = this.rendererFactory.createElementRenderer('a', childRenderers);

        const findLinkRenderer = (link: unknown) => this.linkRenderers.find((linkRenderer) => linkRenderer.supports(link));

        function renderLink(translationParameters: HashMap): HTMLAnchorElement {
            const anchorElement = anchorRenderer(translationParameters);

            const link: unknown = translationParameters[parameterKey];

            const linkRenderer = findLinkRenderer(link);

            if (linkRenderer) {
                linkRenderer.render(link, anchorElement);
            }

            return anchorElement;
        }

        return renderLink;
    }

}

/** Prefix of a link start token. */
const LINK_START_TOKEN = '[link:';

/** String that defines the end tag of a link. */
const LINK_END_TOKEN = '[/link]';

/** Token that represents the closing tag of a link. */
export const LINK_END = new (class LinkEnd {})();

/**
 * Class used for modeling the link start tokens.
 */
export class LinkStart {

    /**
     * Creates a new `LinkStart` that references the specified parameter.
     */
    constructor(
        /** Key of the parameter which stores the link model. */
        public readonly parameterKey: string,
    ) { }
}
