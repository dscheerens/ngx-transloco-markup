import { HashMap } from '@ngneat/transloco';

import { ResolveLinkSpecification } from '../models/resolve-link-specification.model';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

import { SubstitutionTranspiler } from './substitution-transpiler';

/**
 * Configuration options for the `ContextualLinkSubstitutionTranspiler`.
 */
export interface ContextualLinkSubstitutionTranspilerOptions {

    /**
     * Property that defines how to resolve the label text of the link that is to be rendered. The label can be resolved in three different
     * ways:
     *
     * - A static label: `{ static: 'label text' }`
     * - A value stored in the translation parameters: `{ parameterKey: 'nameOfTheParameterContainingTheLabelText' }`
     * - A dynamically resolved label using a function that receives the translation parameters as input:
     *   `{ resolve: (params) => params.foo + '-' + params.bar + '-' + Date.now() }`
     */
    label: { static: string } | { parameterKey: string } | { resolve(translationParams: HashMap): string };

    /**
     * A resolver for the link model specifiying the target location. The link model can be resolved in the same three ways as the label:
     *
     * - A static link: `{ static: { url: 'https://example.com/', target: '_self' } }`
     * - A link stored in the translation parameters: `{ parameterKey: 'targetLink' }`
     * - A dynamically resolved link using a function that receives the translation parameters as input:
     *   `{ resolve: (params) => 'https://petstore.com/' + params.petType }`
     */
    link: ResolveLinkSpecification;

}

/**
 * A substitution transpiler that replaces a specific token with a link. This transpiler is quite useful for defining tokens that are only
 * valid within a specific context (i.e. a limited set of translation entries).
 */
export class ContextualLinkSubstitutionTranspiler extends SubstitutionTranspiler {

    /**
     * Creates a new `ContextualLinkSubstitutionTranspiler` for the specified token and which uses the provided options.
     */
    constructor(
        /** The token which will be substituted with a link. */
        token: string,

        /** Options that define how to resolve the label text and link model. */
        private readonly options: ContextualLinkSubstitutionTranspilerOptions,

        /** Renderer factory used to create the renderer for the HTML anchor element that will be substituted in place of the token. */
        private readonly rendererFactory: TranslationMarkupRendererFactory,

        /** Set of link renderers that are used to apply the link model from the translation parameter to the anchor element. */
        private readonly linkRenderers: LinkRenderer<unknown>[]
    ) {
        super(token);
    }

    /** @inheritdoc */
    protected createRenderer(): TranslationMarkupRenderer {

        const labelRenderer = this.rendererFactory.createTextRenderer((() => {
            const { label } = this.options;

            if ('static' in label) {
                return label.static;
            }

            if ('resolve' in label) {
                return label.resolve; // tslint:disable-line:no-unbound-method
            }

            return (translationParams: HashMap) => String(translationParams[label.parameterKey] || '');
        })());

        const anchorRenderer = this.rendererFactory.createElementRenderer('a', [labelRenderer]);

        const options = this.options;

        const findLinkRenderer = (link: unknown) => this.linkRenderers.find((linkRenderer) => linkRenderer.supports(link));

        return function renderSubstitutionLink(translationParameters: HashMap): HTMLAnchorElement {
            const anchorElement = anchorRenderer(translationParameters);

            const link: unknown = (
                'static' in options.link ? options.link.static :
                'parameterKey' in options.link ? translationParameters[options.link.parameterKey] :
                options.link.resolve(translationParameters)
            );

            const linkRenderer = findLinkRenderer(link);

            if (linkRenderer) {
                linkRenderer.render(link, anchorElement);
            }

            return anchorElement;
        };
    }
}
