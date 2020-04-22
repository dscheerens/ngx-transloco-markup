export function selectFirstWhere<T, U>(array: Iterable<T>, project: (value: T) => U, match: (value: U) => boolean): U | undefined {
    for (const value of array) {
        const projectedValue = project(value);

        if (match(projectedValue)) {
            return projectedValue;
        }
    }

    return undefined;
}
