import { Injector, StaticClassProvider, Type } from '@angular/core';

import { inheritTranslationMarkupTranspilers } from './inherit-transpilers';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';
import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { asFlatArray } from './utils/array';

describe('inheritTranslationMarkupTranspilers function', () => {

    it('provides transpilers from the parent injector', () => {
        const inheritTranspilers = inheritTranslationMarkupTranspilers;
        const injector1 = Injector.create({ providers: [provideTranspiler(ExampleTranspiler1), provideTranspiler(ExampleTranspiler2)] });
        const injector2 = Injector.create({ parent: injector1, providers: [] });
        const injector3 = Injector.create({ parent: injector2, providers: [inheritTranspilers(), provideTranspiler(ExampleTranspiler3)] });
        const injector4 = Injector.create({ parent: injector3, providers: [inheritTranspilers()] });
        const injector5 = Injector.create({ parent: injector4, providers: [provideTranspiler(ExampleTranspiler4), inheritTranspilers()] });

        const transpilers = asFlatArray(injector5.get(TRANSLATION_MARKUP_TRANSPILER));

        expect(transpilers[0]).toBeInstanceOf(ExampleTranspiler4);
        expect(transpilers[1]).toBeInstanceOf(ExampleTranspiler1);
        expect(transpilers[2]).toBeInstanceOf(ExampleTranspiler2);
        expect(transpilers[3]).toBeInstanceOf(ExampleTranspiler3);
    });

});

function provideTranspiler<T extends TranslationMarkupTranspiler>(transpilerClass: Type<T>): StaticClassProvider {
    return {
        provide: TRANSLATION_MARKUP_TRANSPILER,
        useClass: transpilerClass,
        deps: [],
        multi: true,
    };

}

class NullTranspiler implements TranslationMarkupTranspiler {
    public tokenize(): undefined {
        return;
    }

    public transpile(): undefined {
        return;
    }
}

class ExampleTranspiler1 extends NullTranspiler { }
class ExampleTranspiler2 extends NullTranspiler { }
class ExampleTranspiler3 extends NullTranspiler { }
class ExampleTranspiler4 extends NullTranspiler { }
