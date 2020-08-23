import { MaybeArray } from '@ngneat/transloco';

/**
 * Wraps the specified value in an array unless the value already is an array.
 *
 * @param   value Value that is to be wrapped in an array.
 * @returns       If the specified value is an array the specified value is returned as is, otherwise it will be wrapped in array,
 *                containing just the value.
 */
export function asArray<T>(value: MaybeArray<T>): T[] {
    return Array.isArray(value) ? value : [value];
}

/**
 * A recursive array data structure, where a value can either be a scalar value or an array where each element itself is also a recursive
 * array data structure.
 */
export type RecursiveArray<T> = T | RecursiveArray<T>[];

/**
 * Flattens a recursive array (of arbitrary depth) into a one dimensional array. If the specified value is just a scalar value, then it will
 * be wrapped in an array containing only that value.
 *
 * @param   value Value which is to be converted to a flattened array.
 * @returns       A one dimensional array containing all elements from the recursive array.
 */
export function asFlatArray<T>(value: RecursiveArray<T>): T[] {
    return Array.isArray(value)
        ? value.reduce<T[]>((partialResult, element) => partialResult.concat(asFlatArray(element)), [])
        : [value];
}
