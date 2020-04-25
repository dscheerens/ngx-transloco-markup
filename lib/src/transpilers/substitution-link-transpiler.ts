import { Inject, Injectable, Optional } from '@angular/core';
import { HashMap } from '@ngneat/transloco';

import { LinkRenderer } from '../link-renderer.model';
import { TranslationMarkupRendererFactory } from '../translation-markup-renderer-factory';
import { TranslationMarkupRenderer } from '../translation-markup-renderer.model';

import { SubstitutionTranspiler } from './substitution-transpiler';

export interface SubstitutionLinkTranspilerOptions {
    label: { static: string } | { parameterKey: string } | { resolve(translationParams: HashMap): string };
    link: { static: unknown } | { parameterKey: string } | { resolve(translationParams: HashMap): unknown };
}

@Injectable({ providedIn: 'root' })
export class SubstitutionLinkTranspilerFactory {
    private readonly linkRenderers: LinkRenderer<unknown>[];

    constructor(
        private readonly rendererFactory: TranslationMarkupRendererFactory,
        @Inject(LinkRenderer) @Optional() linkRenderers: LinkRenderer<unknown> | LinkRenderer<unknown>[] | null
    ) {
        this.linkRenderers = !linkRenderers ? [] : Array.isArray(linkRenderers) ? linkRenderers : [linkRenderers];
    }

    public create(token: string, options: SubstitutionLinkTranspilerOptions): SubstitutionLinkTranspiler {
        return new SubstitutionLinkTranspiler(token, options, this.rendererFactory, this.linkRenderers);
    }
}

export class SubstitutionLinkTranspiler extends SubstitutionTranspiler {

    constructor(
        token: string,
        private readonly options: SubstitutionLinkTranspilerOptions,
        private readonly rendererFactory: TranslationMarkupRendererFactory,
        private readonly linkRenderers: LinkRenderer<unknown>[]
    ) {
        super(token);
    }

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

        function renderSubstitutionLink(translationParameters: HashMap): HTMLAnchorElement {
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
        }

        return renderSubstitutionLink;
    }
}
