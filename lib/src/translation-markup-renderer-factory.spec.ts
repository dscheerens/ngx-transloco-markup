import { TranslationMarkupRendererFactory } from './translation-markup-renderer-factory';

describe('TranslationMarkupRendererFactory class', () => {

    describe('createTextRenderer function', () => {

        it('can be used the create a translation markup renderer for static text', () => {
            const rendererFactory = new TranslationMarkupRendererFactory(document);

            expect(rendererFactory.createTextRenderer('')({}).textContent).toBe('');

            expect(rendererFactory.createTextRenderer('Apple pie')({}).textContent).toBe('Apple pie');

            expect(rendererFactory.createTextRenderer('Nom nom nom! x3')({}).textContent).toBe('Nom nom nom! x3');
        });

        it('can be used the create a translation markup renderer for dynamically resolved text', () => {
            const rendererFactory = new TranslationMarkupRendererFactory(document);

            expect(rendererFactory.createTextRenderer(() => '')({}).textContent).toBe('');

            expect(rendererFactory.createTextRenderer(() => '123abcXYZ')({}).textContent).toBe('123abcXYZ');

            expect(rendererFactory.createTextRenderer(
                ({ something }) => `Apple ${something}`)({ something: '& Banana' }).textContent
            ).toBe('Apple & Banana');

            expect(rendererFactory.createTextRenderer(
                ({ a, b, c }) => `${a} ${b} ${c}`)({ a: 'Eat', b: 'some', c: 'fruit!'}).textContent
            ).toBe('Eat some fruit!');
        });

    });

    describe('createElementRenderer function', () => {

        it('creates HTML elements with the specified tag', () => {
            const rendererFactory = new TranslationMarkupRendererFactory(document);

            expect(rendererFactory.createElementRenderer('b')({})).toBeInstanceOf(HTMLElement);
            expect(rendererFactory.createElementRenderer('b')({}).tagName).toBe('B');
            expect(rendererFactory.createElementRenderer('i')({})).toBeInstanceOf(HTMLElement);
            expect(rendererFactory.createElementRenderer('i')({}).tagName).toBe('I');
            expect(rendererFactory.createElementRenderer('p')({})).toBeInstanceOf(HTMLParagraphElement);
            expect(rendererFactory.createElementRenderer('a')({})).toBeInstanceOf(HTMLAnchorElement);
            expect(rendererFactory.createElementRenderer('button')({})).toBeInstanceOf(HTMLButtonElement);
            expect(rendererFactory.createElementRenderer('code')({})).toBeInstanceOf(HTMLElement);
            expect(rendererFactory.createElementRenderer('code')({}).tagName).toBe('CODE');
        });

        it('supports child renderers', () => {
            const rendererFactory = new TranslationMarkupRendererFactory(document);

            const render = rendererFactory.createElementRenderer('b', [
                rendererFactory.createTextRenderer('Here\'s '),
                rendererFactory.createElementRenderer('i', [
                    rendererFactory.createTextRenderer(({ name }) => name)
                ]),
                rendererFactory.createTextRenderer('!'),
            ]);

            const result = render({ name: 'Jonny' });

            expect(result.textContent).toBe('Here\'s Jonny!');
            expect(result.querySelector('i')).not.toBeNull();
            expect(result.querySelector('i')!.textContent).toBe('Jonny');
        });

    });

});
