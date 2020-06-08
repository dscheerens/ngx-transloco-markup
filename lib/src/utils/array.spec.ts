import { asArray } from './array';

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
