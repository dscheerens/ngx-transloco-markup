import { Provider } from '@angular/core';

import { UnboundProvider, bindProvider } from './utils/provider-binding';

/**
 * Interface for objects that can render a link. Note that this is abstract class instead of an interface so the class itself can be used as
 * token for injection of the link renderers.
 */
export abstract class LinkRenderer<T> {

    /**
     * Checks whether the link renderer supports the specified link.
     *
     * @param   link Link value for which is to be checked if the renderer supports it.
     * @returns      `true` if the specified link is supported and it safe to be used as argument for the `render` function, `false` if the
     *               link is not supported by the renderer.
     */
    public abstract supports(link: unknown): link is T;

    /**
     * Renders the given link to the specified target element.
     *
     * @param link          Link that is to be rendered.
     * @param targetElement Target anchor element to which the link should be rendered.
     */
    public abstract render(link: T, targetElement: HTMLAnchorElement): void;
}

/**
 * Creates a provider definition for the specified link renderer. The resulting `Provider` object can be used to make the renderer available
 * within a module or component injector scope.
 *
 * @param linkRenderer Specification of the link renderer for which the provider definition is to be created.
 */
export function provideLinkRenderer<T>(linkRenderer: UnboundProvider<LinkRenderer<T>>): Provider {
    return bindProvider(LinkRenderer, linkRenderer, { multi: true });
}
