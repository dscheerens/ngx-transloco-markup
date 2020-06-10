import { ExternalLinkObjectLinkRenderer, StringLinkRenderer } from './default-link-renderers';

describe('StringLinkRenderer class', () => {
    describe('supports function', () => {
        it('returns `true` for string arguments', () => {
            const stringLinkRenderer = new StringLinkRenderer();

            expect(stringLinkRenderer.supports('')).toBe(true);
            expect(stringLinkRenderer.supports('abc')).toBe(true);
            expect(stringLinkRenderer.supports('http://www.example.com')).toBe(true);
            expect(stringLinkRenderer.supports('mailto:john.doe@example.com')).toBe(true);
        });

        it('returns `false` for non-string arguments', () => {
            const stringLinkRenderer = new StringLinkRenderer();

            expect(stringLinkRenderer.supports(Array.from('not a string'))).toBe(false);
            expect(stringLinkRenderer.supports(-1)).toBe(false);
            expect(stringLinkRenderer.supports(0)).toBe(false);
            expect(stringLinkRenderer.supports(1)).toBe(false);
            expect(stringLinkRenderer.supports(true)).toBe(false);
            expect(stringLinkRenderer.supports(false)).toBe(false);
            expect(stringLinkRenderer.supports(null)).toBe(false);
            expect(stringLinkRenderer.supports(undefined)).toBe(false);
            expect(stringLinkRenderer.supports({})).toBe(false);
            expect(stringLinkRenderer.supports({ length: 5, toString: () => 'abcde' })).toBe(false);
        });
    });

    describe('render function', () => {
        it('sets the `href` property of an anchor element to the link', () => {
            const stringLinkRenderer = new StringLinkRenderer();

            const anchorElement = document.createElement('a');

            stringLinkRenderer.render('test://string-link-test.dev/', anchorElement);

            expect(anchorElement.href).toBe('test://string-link-test.dev/');
        });

        it('sets the `target` property of an anchor element to "_blank"', () => {
            const stringLinkRenderer = new StringLinkRenderer();

            const anchorElement = document.createElement('a');

            stringLinkRenderer.render('test://string-link-test.dev/', anchorElement);

            expect(anchorElement.target).toBe('_blank');
        });
    });
});

describe('ExternalLinkObjectLinkRenderer class', () => {
    describe('supports function', () => {
        it('returns `true` for objects conforming to the `ExternalLink` interface', () => {
            const externalLinkObjectRenderer = new ExternalLinkObjectLinkRenderer();

            expect(externalLinkObjectRenderer.supports({ url: 'foo' })).toBe(true);
            expect(externalLinkObjectRenderer.supports({ url: 'abc', target: 'XYZ' })).toBe(true);
            expect(externalLinkObjectRenderer.supports({ url: 'abc', someOtherProperty: 123 })).toBe(true);
        });

        it('returns `false` for values that are not objects conforming to the `ExternalLink` interface', () => {
            const externalLinkObjectRenderer = new ExternalLinkObjectLinkRenderer();

            expect(externalLinkObjectRenderer.supports(Array.from('not an ExternalLink'))).toBe(false);
            expect(externalLinkObjectRenderer.supports(-1)).toBe(false);
            expect(externalLinkObjectRenderer.supports(0)).toBe(false);
            expect(externalLinkObjectRenderer.supports(1)).toBe(false);
            expect(externalLinkObjectRenderer.supports(true)).toBe(false);
            expect(externalLinkObjectRenderer.supports(false)).toBe(false);
            expect(externalLinkObjectRenderer.supports(null)).toBe(false);
            expect(externalLinkObjectRenderer.supports(undefined)).toBe(false);
            expect(externalLinkObjectRenderer.supports({})).toBe(false);
            expect(externalLinkObjectRenderer.supports({ length: 5, toString: () => 'abcde' })).toBe(false);
            expect(externalLinkObjectRenderer.supports({ url: 123 })).toBe(false);
            expect(externalLinkObjectRenderer.supports({ url: Array.from('not a string') })).toBe(false);
            expect(externalLinkObjectRenderer.supports({ target: 'something' })).toBe(false);
        });
    });

    describe('render function', () => {
        it('sets the `href` property of an anchor element to the link url', () => {
            const externalLinkObjectRenderer = new ExternalLinkObjectLinkRenderer();

            const anchorElement = document.createElement('a');

            externalLinkObjectRenderer.render({ url: 'test://string-link-test.dev/' }, anchorElement);

            expect(anchorElement.href).toBe('test://string-link-test.dev/');
        });

        it('sets the `target` property of an anchor element to the specified target of the external link object', () => {
            const externalLinkObjectRenderer = new ExternalLinkObjectLinkRenderer();

            const anchorElement = document.createElement('a');

            externalLinkObjectRenderer.render({ url: 'test://string-link-test.dev/', target: 'Ibiza' }, anchorElement);

            expect(anchorElement.target).toBe('Ibiza');
        });

        it('leaves the `target` property of an anchor element unaltered when the external link object does not specify a target', () => {
            const externalLinkObjectRenderer = new ExternalLinkObjectLinkRenderer();

            const anchorElement = document.createElement('a');

            anchorElement.target = 'Lisbon';

            externalLinkObjectRenderer.render({ url: 'test://string-link-test.dev/' }, anchorElement);

            expect(anchorElement.target).toBe('Lisbon');
        });
    });
});
