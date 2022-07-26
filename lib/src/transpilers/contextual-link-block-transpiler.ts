import { HashMap } from '@ngneat/transloco';

import { LinkRenderer } from '../link-renderer.model';
import { ResolveLinkSpecification } from '../models/resolve-link-specification.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

import { BlockTranspiler } from './block-transpiler';

/**
 * Transpiler for named (special start and end token) link blocks. This can be used instead of the more generic `LinkTranspiler` to create
 * context specific link block transpilers.
 */
export class ContextualLinkBlockTranspiler extends BlockTranspiler {
    /**
     * Creates a new `NamedLinkBlockTranspiler` for the specified start and end token.
     */
    constructor(
        /** Token that defined the start of the link. */
        linkStartToken: string,

        /** Token that defined the end of the link. */
        linkEndToken: string,

        /** Object that specifies how to resolve the link. */
        private readonly resolveLinkSpecification: ResolveLinkSpecification,

        /** Renderer factory used to create the renderer for the HTML anchor element that will be substituted in place of the token. */
        private readonly rendererFactory: TranslationMarkupRendererFactory,

        /** Set of link renderers that are used to apply the link model from the translation parameter to the anchor element. */
        private readonly linkRenderers: LinkRenderer<unknown>[],
    ) {
        super(linkStartToken, linkEndToken);
    }

    /** @inheritdoc */
    public createRenderer(childRenderers: TranslationMarkupRenderer[]): TranslationMarkupRenderer {
        const anchorRenderer = this.rendererFactory.createElementRenderer('a', childRenderers);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const findLinkRenderer = (link: unknown) => this.linkRenderers.find((linkRenderer) => linkRenderer.supports(link));

        const resolveLinkSpecification = this.resolveLinkSpecification;

        return function namedLinkRenderer(translationParameters: HashMap): HTMLAnchorElement {
            const anchorElement = anchorRenderer(translationParameters);

            const link: unknown = (
                'static' in resolveLinkSpecification ? resolveLinkSpecification.static :
                'parameterKey' in resolveLinkSpecification ? translationParameters[resolveLinkSpecification.parameterKey] :
                resolveLinkSpecification.resolve(translationParameters)
            );

            const linkRenderer = findLinkRenderer(link);

            if (linkRenderer) {
                linkRenderer.render(link, anchorElement);
            }

            return anchorElement;
        };
    }
}
