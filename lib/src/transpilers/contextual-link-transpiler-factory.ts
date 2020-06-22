import { Inject, Injectable, Optional } from '@angular/core';

import { asArray } from '../utils/array';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import {
    ContextualLinkSubstitutionTranspiler,
    ContextualLinkSubstitutionTranspilerOptions
} from './contextual-link-substitution-transpiler';

/**
 * Injectable factory service that provides convenience functions for easily creating contextual link transpiler instances.
 */
@Injectable({ providedIn: 'root' })
export class ContextualLinkTranspilerFactory {

    /** Set of link renderers that are used to apply the link model from the translation parameter to the anchor element. */
    private readonly linkRenderers: LinkRenderer<unknown>[];

    /**
     * Creates a new `ContextualLinkTranspilerFactory` that uses the specified renderer factory and link renderers for the creation of the
     * `ContextualLinkSubstitutionTranspiler` instances.
     */
    constructor(
        /** Renderer factory used to create the renderer for the HTML anchor element that will be substituted in place of the token. */
        private readonly rendererFactory: TranslationMarkupRendererFactory,

        /** Set of link renderers that are used to apply the link model from the translation parameter to the anchor element. */
        @Inject(LinkRenderer) @Optional() linkRenderers: LinkRenderer<unknown> | LinkRenderer<unknown>[] | null
    ) {
        this.linkRenderers = !linkRenderers ? [] : asArray(linkRenderers);
    }

    /**
     * Creates a `ContextualLinkSubstitutionTranspiler` that resolves the label and link based on the specified parameter key. The
     * translation parameter value is expected to have a `label` and `link` property. The substitution token is equal to the parameter key
     * wrapped between square brackets: `[parameterKey]`.
     *
     * @param   parameterKey Key of the translation parameter which holds the `label` and `link` subproperties.
     * @returns              The `ContextualLinkSubstitutionTranspiler` that was created.
     */
    public create(parameterKey: string): ContextualLinkSubstitutionTranspiler;

    /**
     * Creates a `ContextualLinkSubstitutionTranspiler` for the specified substitution token and given options.
     *
     * @param   token   The token which will be substituted with a link.
     * @param   options Options that define how to resolve the label text and link model.
     * @returns         The `ContextualLinkSubstitutionTranspiler` that was created.
     */
    public create(
        token: string,
        options: ContextualLinkSubstitutionTranspilerOptions // tslint:disable-line:unified-signatures parameter-formatting
    ): ContextualLinkSubstitutionTranspiler;

    // Unified implementation of the function signatures above.
    public create(
        parameterKeyOrToken: string,
        options?: ContextualLinkSubstitutionTranspilerOptions
    ): ContextualLinkSubstitutionTranspiler {
        if (options === undefined) {
            return this.create(`[${parameterKeyOrToken}]`, {
                label: { resolve: (params) => params[parameterKeyOrToken].label },
                link: { resolve: (params) => params[parameterKeyOrToken].link }
            });
        }

        return new ContextualLinkSubstitutionTranspiler(parameterKeyOrToken, options, this.rendererFactory, this.linkRenderers);
    }

}
