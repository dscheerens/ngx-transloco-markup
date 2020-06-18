import { Inject, Injectable, Optional } from '@angular/core';

import { asArray } from '../utils/array';
import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';

import { SubstitutionLinkTranspiler, SubstitutionLinkTranspilerOptions } from './substitution-link-transpiler';

@Injectable({ providedIn: 'root' })
export class SubstitutionLinkTranspilerFactory {
    private readonly linkRenderers: LinkRenderer<unknown>[];

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory,
        @Inject(LinkRenderer) @Optional() linkRenderers: LinkRenderer<unknown> | LinkRenderer<unknown>[] | null
    ) {
        this.linkRenderers = !linkRenderers ? [] : asArray(linkRenderers);
    }

    public create(parameterKey: string): SubstitutionLinkTranspiler;
    public create(token: string, options: SubstitutionLinkTranspilerOptions): SubstitutionLinkTranspiler; // tslint:disable-line:unified-signatures max-line-length
    public create(parameterKeyOrToken: string, options?: SubstitutionLinkTranspilerOptions): SubstitutionLinkTranspiler {
        if (options === undefined) {
            return this.create(`[${parameterKeyOrToken}]`, {
                label: { resolve: (params) => params[parameterKeyOrToken].label },
                link: { resolve: (params) => params[parameterKeyOrToken].link }
            });
        }

        return new SubstitutionLinkTranspiler(parameterKeyOrToken, options, this.rendererFactory, this.linkRenderers);
    }
}
