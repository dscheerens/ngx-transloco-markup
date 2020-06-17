import { MaybeArray } from '@ngneat/transloco';

/**
 * Wraps the specified value in an array unless the value already is an array.
 *
 * @param   value Value that is to be wrapped in an array.
 * @returns       If the specified value is an array the specified value is returned as is, otherwise it will be wrapped in array,
 *                containing just the value.
 */
export function asArray<T>(value: MaybeArray<T>): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    return [value];
}
