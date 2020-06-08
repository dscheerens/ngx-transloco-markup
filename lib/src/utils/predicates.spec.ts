import { notUndefined } from './predicates';

describe('notUndefined function', () => {
    it('returns `false` if the specified value is undefined', () => {
        expect(notUndefined(undefined)).toBe(false);
    });

    it('returns `true` if the specified value is not undefined', () => {
        for (const value of [null, 0, false, true, 1, 'abc', { foo: 'bar'}, [1, 2, 3, 'X', 'yz', undefined] ]) {
            expect(notUndefined(value)).toBe(true);
        }
    });
});
