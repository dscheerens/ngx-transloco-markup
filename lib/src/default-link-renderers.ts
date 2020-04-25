import { Injectable } from '@angular/core';

import { LinkRenderer } from './link-renderer.model';
import { isExternalLinkObject, ExternalLink } from './link.model';

@Injectable()
export class StringLinkRenderer extends LinkRenderer<string> {
    public supports(link: unknown): link is string {
        return typeof link === 'string';
    }

    public render(link: string, targetElement: HTMLAnchorElement): void {
        targetElement.href = link;
        targetElement.target = '_blank';
    }
}

@Injectable()
export class ExternalLinkObjectLinkRenderer extends LinkRenderer<ExternalLink> {
    public supports(link: unknown): link is ExternalLink {
        return isExternalLinkObject(link);
    }

    public render(link: ExternalLink, targetElement: HTMLAnchorElement): void {
        targetElement.href = link.url;

        if (typeof link.target === 'string') {
            targetElement.target = link.target;
        }
    }
}
