import { Injectable, Optional, Inject } from '@angular/core';
import { HashMap } from '@ngneat/transloco';

import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult, TranslationMarkupTranspilerContext } from '../translation-markup-transpiler.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';
import { LinkRenderer } from '../link-renderer.model';

@Injectable()
export class LinkTranspiler implements TranslationMarkupTranspiler {

    private readonly linkRenderers: LinkRenderer<unknown>[];

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory,
        @Inject(LinkRenderer) @Optional() linkRenderers: LinkRenderer<unknown> | LinkRenderer<unknown>[] | null
    ) {
        this.linkRenderers = !linkRenderers ? [] : Array.isArray(linkRenderers) ? linkRenderers : [linkRenderers];
    }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {

        if (translation.startsWith(LINK_END_TOKEN, offset)) {
            return {
                nextOffset: offset + LINK_END_TOKEN.length,
                token: LINK_END
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
            token: new LinkStart(parameterKey)
        };
    }

    public transpile(tokens: unknown[], start: number, context: TranslationMarkupTranspilerContext): TranspileResult | undefined {
        const nextToken = tokens[start];

        if (!(nextToken instanceof LinkStart)) {
            return undefined;
        }

        const childRenderers: TranslationMarkupRenderer[] = [];
        let offset = start + 1;
        while (offset < tokens.length && tokens[offset] !== LINK_END) {
            const transpileResult = context.transpile(tokens, offset, context);

            if (!transpileResult) {
                break;
            }

            childRenderers.push(transpileResult.renderer);
            offset = transpileResult.nextOffset;
        }

        return {
            nextOffset: offset + 1,
            renderer: this.createRenderer(nextToken.parameterKey, childRenderers)
        };
    }

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

const LINK_END_TOKEN = '[/link]';

const LINK_START_TOKEN = '[link:';

const LINK_END = new (class LinkEnd {})();

class LinkStart {
    constructor(public readonly parameterKey: string) { }
}
