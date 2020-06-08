import { selectFirstWhere } from './iterable';

describe('selectFirstWhere function', () => {
    it('returns undefined for an empty array', () => {
        expect(selectFirstWhere([], (x) => x, () => true)).toBe(undefined);
    });

    it('returns the first projected value that matches the specified predicate', () => {
        expect(selectFirstWhere(['1', '2', '3', '4', '5'], (x) => Number(x) * 2, (y) => y > 7)).toBe(8);

        expect(selectFirstWhere(['apple', 'banana', 'cherry', 'dragonfruit'], (x) => Array.from(x), (x) => x[0] === 'c'))
            .toEqual(['c', 'h', 'e', 'r', 'r', 'y']);
    });
});
