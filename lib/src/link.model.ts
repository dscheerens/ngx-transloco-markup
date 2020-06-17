/**
 * Model used to describe a link that references a resource outside the application.
 */
export interface ExternalLink {

    /** Url of the resource. */
    url: string;

    /** Browser target in wich the link should be opened. */
    target?: string;
}

/**
 * Checks whether the specified value conforms to the `ExternalLink` interface.
 *
 * @param   value Value that is to be checked.
 * @returns       `true` if the specified value conforms to the `ExternalLink` interface, `false` if not.
 */
export function isExternalLinkObject(value: unknown): value is ExternalLink {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const url: unknown = (value as any).url;
    const target: unknown = (value as any).target;

    return typeof url === 'string' && (target === undefined || target === null || typeof target === 'string');
}
