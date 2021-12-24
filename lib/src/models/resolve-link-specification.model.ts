import { HashMap } from '@ngneat/transloco';

/**
 * Specification of how to resolve a link value, which can be done in the following ways:
 *
 * - A static link: `{ static: { url: 'https://example.com/', target: '_self' } }`
 * - A link stored in the translation parameters: `{ parameterKey: 'targetLink' }`
 * - A dynamically resolved link using a function that receives the translation parameters as input:
 *   `{ resolve: (params) => 'https://petstore.com/' + params.petType }`
 */
export type ResolveLinkSpecification =
    | { static: unknown }
    | { parameterKey: string }
    | { resolve(translationParams: HashMap): unknown };
