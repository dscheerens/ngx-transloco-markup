import { hasProperty } from '../utils/has-property';

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
    return (
        typeof value === 'object' &&
        value !== null &&
        hasProperty(value, 'url') && typeof value.url === 'string' &&
        (!hasProperty(value, 'target') || value.target === undefined || value.target === null || typeof value.target === 'string')
    );
}
