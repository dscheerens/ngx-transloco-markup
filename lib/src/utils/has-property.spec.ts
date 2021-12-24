import { hasProperty } from './has-property';

describe('hasProperty function', () => {
    it('returns `false` for non-object values', () => {
        expect(hasProperty(null, 'toString')).toBe(false);
        expect(hasProperty(undefined, 'toString')).toBe(false);
        expect(hasProperty(1, 'toString')).toBe(false);
        expect(hasProperty(true, 'toString')).toBe(false);
        expect(hasProperty('hello', 'toString')).toBe(false);
        expect(hasProperty(Symbol(), 'toString')).toBe(false);
        expect(hasProperty(() => {}, 'toString')).toBe(false);
    });

    it('returns `false` when the target object does not contain the specified property key', () => {
        expect(hasProperty({}, 'foo')).toBe(false);
        expect(hasProperty({ foo: true }, 'bar')).toBe(false);
        expect(hasProperty({ foo: true, bar: false }, 'baz')).toBe(false);
    });

    it('returns `true` when the target object contains the specified property key', () => {
        expect(hasProperty({ foo: false }, 'foo')).toBe(true);
        expect(hasProperty({ bar: {} }, 'bar')).toBe(true);
        expect(hasProperty({ a: 1, b: 'b', c: [] }, 'c')).toBe(true);
    });
});
