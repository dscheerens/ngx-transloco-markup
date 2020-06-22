import { Inject, Injectable, Optional } from '@angular/core';

import { ResolveLinkSpecification } from '../models/resolve-link-specification.model';
import { asArray } from '../utils/array';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import { ContextualLinkBlockTranspiler } from './contextual-link-block-transpiler';
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
     * Creates a new `ContextualLinkTranspilerFactory` that uses the specified renderer factory and link renderers for the creation of
     * `ContextualLinkBlockTranspiler` and `ContextualLinkSubstitutionTranspiler` instances.
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
     * Creates a `ContextualLinkBlockTranspiler` that resolves the link based on the specified parameter key. The start and end tokens are
     * also based on the parameter key, which are equal to `[parameterKey]` and `[/parameterKey]`.
     *
     * @param   parameterKey Key of the translation parameter which holds the `link` model.
     * @returns              The `ContextualLinkSubstitutionTranspiler` that was created.
     */
    public createBlockTranspiler(parameterKey: string): ContextualLinkBlockTranspiler;

    /**
     * Creates a `ContextualLinkSubstitutionTranspiler` for the specified tokens and link specification resolver.
     *
     * @param   startToken               Token that defined the start of the link.
     * @param   endToken                 Token that defined end start of the link.
     * @param   resolveLinkSpecification Object that specifies how to resolve the link.
     * @returns                          The `ContextualLinkBlockTranspiler` that was created.
     */
    public createBlockTranspiler(
        startToken: string,
        endToken: string,
        resolveLinkSpecification: ResolveLinkSpecification
    ): ContextualLinkBlockTranspiler;

    // Unified implementation of the `createBlockTranspiler` function signatures above.
    public createBlockTranspiler(
        parameterKeyOrStartToken: string,
        endToken?: string,
        resolveLinkSpecification?: ResolveLinkSpecification
    ): ContextualLinkBlockTranspiler {
        if (endToken === undefined || resolveLinkSpecification === undefined) {
            const parameterKey = parameterKeyOrStartToken;

            return this.createBlockTranspiler(`[${parameterKey}]`, `[/${parameterKey}]`, { parameterKey });
        }

        const startToken = parameterKeyOrStartToken;

        return new ContextualLinkBlockTranspiler(startToken, endToken, resolveLinkSpecification, this.rendererFactory, this.linkRenderers);
    }

    /**
     * Creates a `ContextualLinkSubstitutionTranspiler` that resolves the label and link based on the specified parameter key. The
     * translation parameter value is expected to have a `label` and `link` property. The substitution token is equal to the parameter key
     * wrapped between square brackets: `[parameterKey]`.
     *
     * @param   parameterKey Key of the translation parameter which holds the `label` and `link` subproperties.
     * @returns              The `ContextualLinkSubstitutionTranspiler` that was created.
     */
    public createSubstitutionTranspiler(parameterKey: string): ContextualLinkSubstitutionTranspiler;

    /**
     * Creates a `ContextualLinkSubstitutionTranspiler` for the specified substitution token and given options.
     *
     * @param   token   The token which will be substituted with a link.
     * @param   options Options that define how to resolve the label text and link model.
     * @returns         The `ContextualLinkSubstitutionTranspiler` that was created.
     */
    public createSubstitutionTranspiler(
        token: string,
        options: ContextualLinkSubstitutionTranspilerOptions // tslint:disable-line:unified-signatures parameter-formatting
    ): ContextualLinkSubstitutionTranspiler;

    // Unified implementation of the `createSubstitutionTranspiler` function signatures above.
    public createSubstitutionTranspiler(
        parameterKeyOrToken: string,
        options?: ContextualLinkSubstitutionTranspilerOptions
    ): ContextualLinkSubstitutionTranspiler {
        if (options === undefined) {
            return this.createSubstitutionTranspiler(`[${parameterKeyOrToken}]`, {
                label: { resolve: (params) => params[parameterKeyOrToken].label },
                link: { resolve: (params) => params[parameterKeyOrToken].link }
            });
        }

        return new ContextualLinkSubstitutionTranspiler(parameterKeyOrToken, options, this.rendererFactory, this.linkRenderers);
    }

}
