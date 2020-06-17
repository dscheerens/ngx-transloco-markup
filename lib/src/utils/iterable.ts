/**
 * Selects the first projected value that matches the specified predicate. In case no matching value can be found, `undefined` will be
 * returned.
 *
 * @param   iterable Iterable that produces the values that will be projected.
 * @param   project  Mapping function that is applied to values from the iterable.
 * @param   match    Predicate function that determines whether the projected value should be returned by this function.
 * @returns          First project value from the iterable that matches the specified predicate or `undefined` no such value was found.
 */
export function selectFirstWhere<T, U>(iterable: Iterable<T>, project: (value: T) => U, match: (value: U) => boolean): U | undefined {
    for (const value of iterable) {
        const projectedValue = project(value);

        if (match(projectedValue)) {
            return projectedValue;
        }
    }

    return undefined;
}
