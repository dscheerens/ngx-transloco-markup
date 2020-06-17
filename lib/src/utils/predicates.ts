/**
 * Checks whether the specified value is not exactly equal to `undefined`.
 *
 * @param   value Value which is to be checked.
 * @returns       `true` if the specified value is not exactly equal to `undefined` or `true` if it is.
 */
export function notUndefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}
