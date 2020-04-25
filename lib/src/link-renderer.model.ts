export abstract class LinkRenderer<T> {
    public abstract supports(link: unknown): link is T;
    public abstract render(link: T, targetElement: HTMLAnchorElement): void;
}
