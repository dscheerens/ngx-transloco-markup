export type Link = string | ExternalLink;

export interface ExternalLink {
    url: string;
    target?: string;
}

export function isExternalLinkObject(value: unknown): value is ExternalLink {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const url: unknown = (value as any).url;
    const target: unknown = (value as any).target;

    return typeof url === 'string' && (target === undefined || target === null || typeof target === 'string');
}
