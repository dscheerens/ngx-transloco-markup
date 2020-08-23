import { asArray, asFlatArray } from './array';

describe('asArray function', () => {
    it('converts a non-array value to an array containing that value', () => {
        const values = [true, false, null, undefined, -1, 0, 1, 'abc', {}, { a: [], b: 123, c: 'def' } ];

        for (const value of values) {
            const array = asArray(value);
            expect(Array.isArray(array)).toBe(true);
            expect(array.length).toBe(1);
            expect(array[0]).toBe(value);
        }
    });

    it('returns array values passed as input unaltered', () => {
        const values = [[], [1, 2, 3], ['a', 'b', 'c'], [[[]]], [true, false, null, undefined, -1, 0, 1, 'abc', {}]];

        for (const value of values) {
            expect(asArray(value)).toBe(value);
        }
    });
});

describe('asFlatArray function', () => {
    it('converts a scalar (non-array) value to an array containing that value', () => {
        const values = [true, false, null, undefined, -1, 0, 1, 'abc', {}, { a: [], b: 123, c: 'def' } ];

        for (const value of values) {
            const array = asFlatArray(value);
            expect(Array.isArray(array)).toBe(true);
            expect(array.length).toBe(1);
            expect(array[0]).toBe(value);
        }
    });

    it('flattens a recursive array of arbitrary depth into an array of just dimension', () => {
        const values = [[], [1, 2, 3], ['a', 'b', ['c', ['d', ['e'], 'f']]], [[[]]], [true, false, null, undefined, -1, 0, 1, 'abc', {}]];

        expect(asFlatArray(values)).toEqual([1, 2, 3, 'a', 'b', 'c', 'd', 'e', 'f', true, false, null, undefined, -1, 0, 1, 'abc', {}]);
    });
});
