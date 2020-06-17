import { Injectable } from '@angular/core';

import { LinkRenderer } from './link-renderer.model';
import { isExternalLinkObject, ExternalLink } from './link.model';

/**
 * Link renderer for string values, where the value is interpreted as the URL to an external resource. The renderer will set the browser
 * target for the link to `_blank` (a new window/tab).
 */
@Injectable()
export class StringLinkRenderer extends LinkRenderer<string> {

    /** @inheritdoc */
    public supports(link: unknown): link is string {
        return typeof link === 'string';
    }

    /** @inheritdoc */
    public render(link: string, targetElement: HTMLAnchorElement): void {
        targetElement.href = link;
        targetElement.target = '_blank';
    }
}

/**
 * Link renderer that supports rendering of `ExternalLink` objects.
 */
@Injectable()
export class ExternalLinkObjectLinkRenderer extends LinkRenderer<ExternalLink> {

    /** @inheritdoc */
    public supports(link: unknown): link is ExternalLink {
        return isExternalLinkObject(link);
    }

    /** @inheritdoc */
    public render(link: ExternalLink, targetElement: HTMLAnchorElement): void {
        targetElement.href = link.url;

        if (typeof link.target === 'string') {
            targetElement.target = link.target;
        }
    }
}
