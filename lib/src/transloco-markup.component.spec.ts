import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { of } from 'rxjs';
import { createComponentFactory } from '@ngneat/spectator'; // tslint:disable-line:no-implicit-dependencies
import {
    TRANSLOCO_CONFIG,
    TRANSLOCO_LOADER,
    TRANSLOCO_MISSING_HANDLER,
    TRANSLOCO_SCOPE,
    TestingLoader,
    TranslocoConfig,
    TranslocoMissingHandler,
    TranslocoService,
    TranslocoTestingModule,
    translocoConfig
} from '@ngneat/transloco';

import { defaultTranslocoMarkupTranspilers } from './default-transloco-markup-transpilers';
import { TokenizeResult, TranslationMarkupTranspiler, TranspileResult } from './translation-markup-transpiler.model';
import { TranslocoMarkupComponent } from './transloco-markup.component';

const translations = {
    en: {
        TITLE: 'Welcome to [b]Transloco [i]Markup[/i][/b]',
        EMPTY: '',
        CALL_TO_ACTION: 'Click [link:presents]here[/link] for some [b]awesome presents[/b] provided by [i]{{ name }}[/i]'
    },
    nl: {
        TITLE: 'Welkom bij [b]Transloco [i]Markup[/i][/b]',
        EMPTY: '',
        CALL_TO_ACTION: 'Klik [link:presents]hier[/link] voor [b]geweldige cadeautjes[/b] geleverd door [i]{{ name }}[/i]'
    },
    l33t: {
        TITLE: 'W31c0m3 70 [b]7r4n5l0c0 [i]M4rkup[/i][/b]',
        EMPTY: '',
        CALL_TO_ACTION: 'cl1ck [link:presents]h3r3[/link] f0r 50m3 [b]4w350m3 pr353n75[/b] pr0v1d3d by [i]{{ name }}[/i]',
        SECRET: 'b335 m4k3 h0n3y',
    }
};

function createTestTranslocoConfig(overrides: Partial<TranslocoConfig> = {}): TranslocoConfig {
    return translocoConfig({
        availableLangs: Object.keys(translations),
        defaultLang: Object.keys(translations)[0],
        prodMode: true,
        missingHandler: { logMissingKey: false },
        ...overrides
    });
}

describe('Transloco markup component', () => {

    const createComponent = createComponentFactory({
        component: TranslocoMarkupComponent,
        imports: [
            TranslocoTestingModule.withLangs(translations, createTestTranslocoConfig())
        ],
        providers: [
            defaultTranslocoMarkupTranspilers(),
            { provide: TRANSLOCO_SCOPE, useValue: null }
        ]
    });

    it('can render translations with markup', () => {
        const { component, element } = createComponent({
            props: {
                translationKey: 'TITLE'
            }
        });

        expect(component).toBeDefined();
        expect(element.textContent).toBe('Welcome to Transloco Markup');
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('b')!.textContent).toBe('Transloco Markup');
        expect(element.querySelector('i')).toBeDefined();
        expect(element.querySelector('i')!.textContent).toBe('Markup');
    });

    it('renders an empty element when no translation key is specified', () => {
        const { element } = createComponent();

        expect(element.firstChild).toBeNull();
    });

    it('supports inline language specification', () => {
        const { element } = createComponent({
            props: {
                translationKey: 'TITLE',
                inlineLanguage: 'nl'
            },
        });

        expect(element.textContent).toBe('Welkom bij Transloco Markup');
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('i')).toBeDefined();
    });

    it('renders the translation when the inline language specification changes', () => {
        const { element, component } = createComponent({
            props: {
                translationKey: 'TITLE',
            },
        });

        expect(element.textContent).toBe('Welcome to Transloco Markup');
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('i')).toBeDefined();

        component.inlineLanguage = 'nl';

        expect(element.textContent).toBe('Welkom bij Transloco Markup');
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('i')).toBeDefined();

        component.inlineLanguage = 'l33t';

        expect(element.textContent).toBe('W31c0m3 70 7r4n5l0c0 M4rkup');
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('i')).toBeDefined();
    });

    it('will rerender when the language is changed via the `TranslocoService` and the reRenderOnLangChange option is enabled', () => {
        const { element, get } = createComponent({
            props: {
                translationKey: 'TITLE',
            },
            providers: [
                {
                    provide: TRANSLOCO_CONFIG,
                    useValue: createTestTranslocoConfig({
                        reRenderOnLangChange: true
                    })
                }
            ]
        });

        const translocoService = get(TranslocoService);

        expect(element.textContent).toBe('Welcome to Transloco Markup');

        translocoService.setActiveLang('nl');

        expect(element.textContent).toBe('Welkom bij Transloco Markup');
    });

    it('will not rerender when the language is changed via the `TranslocoService` and the reRenderOnLangChange option is disabled', () => {
        const { element, get } = createComponent({
            props: {
                translationKey: 'TITLE'
            }
        });

        const translocoService = get(TranslocoService);

        expect(element.textContent).toBe('Welcome to Transloco Markup');

        translocoService.setActiveLang('nl');

        expect(element.textContent).toBe('Welcome to Transloco Markup');
    });

    it('ignores the language changes of the `TranslocoService` when a static inline language is specified', () => {
        const { element, get } = createComponent({
            props: {
                translationKey: 'TITLE',
                inlineLanguage: 'l33t|static'
            },
            providers: [
                {
                    provide: TRANSLOCO_CONFIG,
                    useValue: createTestTranslocoConfig({
                        reRenderOnLangChange: true
                    })
                }
            ]
        });

        const translocoService = get(TranslocoService);

        expect(element.textContent).toBe('W31c0m3 70 7r4n5l0c0 M4rkup');

        translocoService.setActiveLang('nl');

        expect(element.textContent).toBe('W31c0m3 70 7r4n5l0c0 M4rkup');
    });

    it('uses the provided translation parameters to render the translation text with markup', () => {
        const { component, element } = createComponent({
            props: {
                translationKey: 'CALL_TO_ACTION',
                translationParameters: {
                    presents: 'https://tooth-fairy.webshops.com/',
                    name: 'the Tooth Fairy'
                }
            }
        });

        expect(element.textContent).toBe('Click here for some awesome presents provided by the Tooth Fairy');
        expect(element.querySelector('a')).toBeDefined();
        expect(element.querySelector('a')!.textContent).toBe('here');
        expect(element.querySelector('a')!.href).toBe('https://tooth-fairy.webshops.com/');
        expect(element.querySelector('a')!.target).toBe('_blank');
        expect(element.querySelector('i')).toBeDefined();
        expect(element.querySelector('i')!.textContent).toBe('the Tooth Fairy');

        component.translationParameters = {
            presents: { url: 'https://easter-eggies.com/', target: '_self' },
            name: 'de Paashaas'
        };

        expect(element.textContent).toBe('Click here for some awesome presents provided by de Paashaas');
        expect(element.querySelector('a')).toBeDefined();
        expect(element.querySelector('a')!.textContent).toBe('here');
        expect(element.querySelector('a')!.href).toBe('https://easter-eggies.com/');
        expect(element.querySelector('a')!.target).toBe('_self');
        expect(element.querySelector('i')).toBeDefined();
        expect(element.querySelector('i')!.textContent).toBe('de Paashaas');

        component.inlineLanguage = 'nl';

        expect(element.textContent).toBe('Klik hier voor geweldige cadeautjes geleverd door de Paashaas');
        expect(element.querySelector('a')).toBeDefined();
        expect(element.querySelector('a')!.textContent).toBe('hier');
        expect(element.querySelector('a')!.href).toBe('https://easter-eggies.com/');
        expect(element.querySelector('a')!.target).toBe('_self');
        expect(element.querySelector('i')).toBeDefined();
        expect(element.querySelector('i')!.textContent).toBe('de Paashaas');
    });

    it('uses the `TranslocoMissingHandler` to resolve translation texts for translations not available in the active language', () => {
        const { element, get, component } = createComponent({
            props: {
                translationKey: 'TITLE'
            }
        });

        const missingHandler = get<TranslocoMissingHandler>(TRANSLOCO_MISSING_HANDLER);
        const handleMissingTranslationSpy = spyOn(missingHandler, 'handle').and.callThrough();

        expect(handleMissingTranslationSpy).not.toHaveBeenCalled();

        component.translationKey = 'UNKNOWN';

        expect(handleMissingTranslationSpy).toHaveBeenCalled();
        expect(handleMissingTranslationSpy.calls.first().args[0]).toBe('UNKNOWN');
        expect(handleMissingTranslationSpy.calls.first().args[1].activeLang).toBe('en');
        expect(element.textContent).toBe('UNKNOWN');

        handleMissingTranslationSpy.calls.reset();
        component.translationKey = 'EMPTY';

        expect(handleMissingTranslationSpy).toHaveBeenCalled();
        expect(handleMissingTranslationSpy.calls.first().args[0]).toBe('EMPTY');
        expect(handleMissingTranslationSpy.calls.first().args[1].activeLang).toBe('en');
        expect(element.textContent).toBe('EMPTY');
    });

    it('renders an empty texts for empty translation texts and the `allowEmptyValues` option is enabled in the Transloco config', () => {
        const { element, get, component } = createComponent({
            props: {
                translationKey: 'TITLE'
            },
            providers: [
                {
                    provide: TRANSLOCO_CONFIG,
                    useValue: createTestTranslocoConfig({
                        missingHandler: { allowEmpty: true }
                    })
                }
            ]
        });

        const missingHandler = get<TranslocoMissingHandler>(TRANSLOCO_MISSING_HANDLER);
        const handleMissingTranslationSpy = spyOn(missingHandler, 'handle').and.callThrough();

        expect(handleMissingTranslationSpy).not.toHaveBeenCalled();

        component.translationKey = 'EMPTY';

        expect(handleMissingTranslationSpy).not.toHaveBeenCalled();
        expect(element.textContent).toBe('');
    });

    it('uses the configured fallback language for translations not available in the active language', () => {
        const { element } = createComponent({
            props: {
                translationKey: 'SECRET'
            },
            providers: [
                {
                    provide: TRANSLOCO_CONFIG,
                    useValue: createTestTranslocoConfig({
                        missingHandler: { logMissingKey: false, useFallbackTranslation: true },
                        fallbackLang: ['l33t', 'nl']
                    })
                }
            ]
        });

        expect(element.textContent).toBe('b335 m4k3 h0n3y');
    });

    it('supports inline transpilers', () => {
        const convertBoldTagsToMarkdown = new StringReplaceTranspiler(new Map([
            ['[b]', '**'],
            ['[/b]', '**'],
        ]));

        const { element } = createComponent({
            props: {
                translationKey: 'TITLE',
                inlineTranspilers: convertBoldTagsToMarkdown
            }
        });

        expect(element.textContent).toBe('Welcome to **Transloco Markup**');
        expect(element.querySelector('b')).toBeNull();
        expect(element.querySelector('i')).toBeDefined();
    });

    it('can exclude the provided transpilers when inline transpilers are specified and `mergeTranspilers` is set to `false`', () => {
        const convertBoldTagsToMarkdown = new StringReplaceTranspiler(new Map([
            ['[b]', '**'],
            ['[/b]', '**'],
        ]));

        const { element } = createComponent({
            props: {
                translationKey: 'TITLE',
                inlineTranspilers: convertBoldTagsToMarkdown,
                mergeTranspilers: false
            }
        });

        expect(element.textContent).toBe('Welcome to **Transloco [i]Markup[/i]**');
        expect(element.querySelector('b')).toBeNull();
        expect(element.querySelector('i')).toBeNull();
    });

    it('supports provided scopes', fakeAsync(() => {
        const { element, component } = createComponent({
            props: {
                translationKey: 'alt.TITLE'
            },
            providers: [
                {
                    provide: TRANSLOCO_SCOPE,
                    useValue: [{
                        scope: 'alt',
                        loader: {
                            'alt/en': () => Promise.resolve({
                                TITLE: 'You are welcomed to [i]Transloco [b]Markup[/b][/i]'
                            }),
                            'alt/nl': () => Promise.resolve({
                                SECRET: '[b]P[/b]sssst!'
                            })
                        }
                    }]
                }
            ]
        });

        flushMicrotasks();

        expect(element.textContent).toBe('You are welcomed to Transloco Markup');
        expect(element.querySelector('i')).toBeDefined();
        expect(element.querySelector('i')!.textContent).toBe('Transloco Markup');
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('b')!.textContent).toBe('Markup');

        component.inlineLanguage = 'nl';
        component.translationKey = 'alt.SECRET';

        flushMicrotasks();

        expect(element.textContent).toBe('Psssst!');
        expect(element.querySelector('i')).toBeNull();
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('b')!.textContent).toBe('P');
    }));

    it('supports inlines scopes', () => {
        const { element, get, fixture, component } = createComponent({
            props: {
                translationKey: 'alt.SECRET',
                inlineScope: 'alt'
            },
            detectChanges: false
        });

        const testingLoader: TestingLoader = get<TestingLoader>(TRANSLOCO_LOADER);

        spyOn(testingLoader, 'getTranslation').and.callFake((path: string) => {
                if (path === 'en') {
                    return of(translations.en);
                }

                if (path === 'alt/en') {
                    return of({
                        SECRET: 'You can find [b]treasure[/b] hidden inside this code!'
                    });
                }

                if (path === 'clue/en') {
                    return of({
                        SECRET: 'Dig [i]deeper[/i]!'
                    });
                }

                throw new Error(`No mock loader has been defined for "${path}"`);
            });

        fixture.detectChanges();

        expect(element.textContent).toBe('You can find treasure hidden inside this code!');
        expect(element.querySelector('b')).toBeDefined();
        expect(element.querySelector('b')!.textContent).toBe('treasure');

        component.inlineScope = 'clue';
        component.translationKey = 'clue.SECRET';

        expect(element.textContent).toBe('Dig deeper!');
        expect(element.querySelector('i')).toBeDefined();
        expect(element.querySelector('i')!.textContent).toBe('deeper');
    });

});

class StringReplaceTranspiler implements TranslationMarkupTranspiler {

    private readonly Replacement = class Replacement {
        constructor(public readonly value: string) { }
    };

    constructor(
        private readonly replacements: Map<string, string>
    ) { }

    public tokenize(translation: string, offset: number): TokenizeResult | undefined {
        for (const [key, value] of this.replacements) {
            if (translation.startsWith(key, offset)) {
                return {
                    token: new this.Replacement(value),
                    nextOffset: offset + key.length
                };
            }
        }

        return undefined;
    }

    public transpile(tokens: unknown[], offset: number): TranspileResult | undefined {

        const token = tokens[offset];

        if (!(token instanceof this.Replacement)) {
            return undefined;
        }

        return {
            renderer: () => document.createTextNode(token.value),
            nextOffset: offset + 1
        };
    }

}
