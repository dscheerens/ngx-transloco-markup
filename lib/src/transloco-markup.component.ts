import {
  ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnDestroy, OnInit, Optional, ViewEncapsulation,
} from '@angular/core';
import {
  HashMap, InlineLoader, MaybeArray, TRANSLOCO_LANG, TRANSLOCO_MISSING_HANDLER, TRANSLOCO_SCOPE, Translation, TranslocoMissingHandler,
  TranslocoScope, TranslocoService, getPipeValue,
} from '@ngneat/transloco';
import { EMPTY, Observable, Subscription, combineLatest, concat, of } from 'rxjs';
import { distinctUntilChanged, first, map, shareReplay, skip, switchMap } from 'rxjs/operators';

import { createTranslationMarkupRenderer } from './create-translation-markup-renderer';
import { STRING_INTERPOLATION_TRANSPILER } from './string-interpolation-transpiler.token';
import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';
import { StringLiteralTranspiler } from './transpilers/string-literal-transpiler';
import { RecursiveArray, asArray, asFlatArray } from './utils/array';
import { selectFirstWhere } from './utils/iterable';
import { observeProperty } from './utils/observe-property';
import { notUndefined } from './utils/predicates';

/* eslint-disable @angular-eslint/no-input-rename, @angular-eslint/component-selector, @angular-eslint/use-component-view-encapsulation */

/**
 * Component that supports rendering of translations including HTML markup.
 */
@Component({
    selector: 'transloco',
    template: '',
    styles: [':host { display: inline; }'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class TranslocoMarkupComponent implements OnInit, OnDestroy {
    /** Key of the translation text that needs to be displayed. If no value is specified, the component will render an empty element. */
    @Input('key') public translationKey?: string;

    /** Optional object that contains the values to be used for parameterized translation texts. */
    @Input('params') public translationParameters?: HashMap;

    /** Language in which the text is the displayed. Overrides the provided language and language set using the translation service. */
    @Input('lang') public inlineLanguage?: string;

    /** Optional translation scope. */
    @Input('scope') public inlineScope?: string;

    /** Transpilers used to parse and render translation texts with markup. Merged with the provided transpilers. */
    @Input('transpilers') public inlineTranspilers?: MaybeArray<TranslationMarkupTranspiler>;

    /** Whether the inline transpilers should be merged with the provided ones. If set to `false` only the inline transpilers are used. */
    @Input() public mergeTranspilers?: boolean;

    /** Root subscription to which all subscriptions are added that depend on the life cycle of the component instance. */
    private readonly subscriptions = new Subscription();

    /**
     * Creates a new `TranslocoMarkupComponent` instance.
     */
    constructor(
        /** Reference to the element which serves as the host for the component instance. */
        private readonly hostElement: ElementRef<HTMLElement>,

        /** `TranslocoService` instance that is to be used for loading translations and obtaining the Transloco configuration. */
        private readonly translocoService: TranslocoService,

        /** Handler used for translation keys for which no translation value is defined in the active language. */
        @Inject(TRANSLOCO_MISSING_HANDLER) private readonly missingHandler: TranslocoMissingHandler,

        /** Translation scope that is provided via the module/component injectors. */
        @Optional() @Inject(TRANSLOCO_SCOPE) private readonly providedScope: MaybeArray<TranslocoScope> | null,

        /** Language that is provided via the module/component injectors. */
        @Optional() @Inject(TRANSLOCO_LANG) private readonly providedLanguage: string | null,

        /** Markup transpilers provided via the module/component injectors. */
        @Optional() @Inject(TRANSLATION_MARKUP_TRANSPILER)
        private readonly providedTranspilers: RecursiveArray<TranslationMarkupTranspiler> | null,

        /** Transpiler that is used for expanding string interpolation expressions. */
        @Inject(STRING_INTERPOLATION_TRANSPILER) private readonly stringInterpolationTranspiler: TranslationMarkupTranspiler,

        /** Transpiler used for rendering all unprocessed tokens in the translation values as literal text. */
        private readonly stringLiteralTranspiler: StringLiteralTranspiler,
    ) {}

    /**
     * Initializes the component. When this method is called it starts listening for input property changes on the component and language
     * changes from the `TranslocoService`. This results in a stream containing the rendering function, which is executed for every change
     * to render the translation text including markup to the host element of the component instance.
     */
    public ngOnInit(): void {
        const translationKey$ = observeProperty(this as TranslocoMarkupComponent, 'translationKey');
        const translationParameters$ = observeProperty(this as TranslocoMarkupComponent, 'translationParameters');
        const inlineLanguage$ = observeProperty(this as TranslocoMarkupComponent, 'inlineLanguage');
        const inlineScope$ = observeProperty(this as TranslocoMarkupComponent, 'inlineScope');
        const inlineTranspilers$ = observeProperty(this as TranslocoMarkupComponent, 'inlineTranspilers');
        const mergeTranspilers$ = observeProperty(this as TranslocoMarkupComponent, 'mergeTranspilers').pipe(
            map((mergeTranspilers) => mergeTranspilers !== false),
        );

        // Create the language$ stream that defines which in what language the translation text should be displayed.
        const langChanges$ = this.translocoService.langChanges$;

        const activeLanguage$ = this.translocoService.config.reRenderOnLangChange ? langChanges$ : langChanges$.pipe(
            first(),
            shareReplay({ bufferSize: 1, refCount: true }),
        );

        const language$ = resolveLanguage(inlineLanguage$, of(this.providedLanguage ?? undefined), activeLanguage$);

        // Create the scope$ stream that emits an array of scopes to be used for resolving the translation text.
        const scopes$ = inlineScope$.pipe(
            map((inlineScope) => !!inlineScope ? inlineScope : this.providedScope),
            distinctUntilChanged(),
            map((scope) => Array.isArray(scope) ? scope : [!!scope ? scope : undefined]),
        );

        // Using the language$ and scope$ stream obtain the translation$ stream that emits the translation dictionary to use.
        const translation$ = combineLatest([language$, scopes$]).pipe(
            switchMap(([language, scopes]) =>
                combineLatest(scopes.map((scope) => {
                    const scopeName = getScopeName(scope);
                    const path = getLanguagePath(language, scopeName);
                    const inlineLoader = getScopeInlineLoader(scope);

                    return this.translocoService._loadDependencies(path, inlineLoader);
                })).pipe(
                    map(() => this.translocoService.getTranslation(language)),
                ),
            ),
        );

        // Define the translationValue$ stream that emits the (unparsed) translation text that is to be displayed.
        const translationValue$ = combineLatest([translationKey$, translation$]).pipe(
            map(([key, translation]) => {
                if (key === undefined) {
                    return { value: '', translation };
                }

                const useFallbackTranslation = this.translocoService.config.missingHandler!.useFallbackTranslation ?? false;
                const firstFallbackLanguage = asArray(this.translocoService.config.fallbackLang ?? [])[0];
                const fallbackTranslation =
                    useFallbackTranslation && firstFallbackLanguage ? [this.translocoService.getTranslation(firstFallbackLanguage)] : [];

                return this.getTranslationValue(key, [translation, ...fallbackTranslation]);
            }),
        );

        // Create the transpilers$ stream based on the inline providers, the provided providers and the merge transpilers setting.
        const transpilers$ = combineLatest([inlineTranspilers$, mergeTranspilers$]).pipe(
            map(([inlineTranspilers, mergeTranspilers]) => [
                ...(inlineTranspilers ? asArray(inlineTranspilers) : []),
                ...(this.providedTranspilers && (!inlineTranspilers || mergeTranspilers) ? asFlatArray(this.providedTranspilers) : []),
                this.stringInterpolationTranspiler,
                this.stringLiteralTranspiler,
            ]),
        );

        // Finally we can create the render$ stream that emits the rendering function based on the translation text and the tranpilers.
        const render$ = combineLatest([translationValue$, transpilers$]).pipe(
            map(([{ translation, value }, transpilers]) => createTranslationMarkupRenderer(value, transpilers, translation)),
        );

        // By combining the render$ and translationParameters$ stream the component can render the translation whenever something changes.
        this.subscriptions.add(combineLatest([render$, translationParameters$]).subscribe(
            ([render, translationParameters]) => render(this.hostElement.nativeElement, translationParameters ?? {}),
        ));
    }

    /**
     * Called when the component is destroyed. Will cleanup any active subscriptions.
     */
    public ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Determines the translation value for the specified `key` and `translations`. Will return the first value of a translation which
     * contains the specified key. If no such translation exists, the `TranslocoMissingHandler` is used to obtain a value. For translations
     * where the value is an empty string the `TranslocoMissingHandler` is also used to determine if such values are allowed. If so, the
     * function will also return an empty string as translation value. When empty values are not allowed these will be considered as a
     * missing translation value for the tested translation.
     *
     * @param   key          Key for which the translation value is to be retrieved.
     * @param   translations Set of translations which are to be checked for the translation value identified by `key` parameter.
     * @returns              An object that defines the translation value and the translation dictionary containing the value.
     */
    private getTranslationValue(key: string, translations: Translation[]): { value: string; translation: Translation } {
        const allowEmptyValues = this.translocoService.config.missingHandler!.allowEmpty;

        // Find the first translation containing the specified translation key and obtain the translation value.
        const result = selectFirstWhere(
            translations,
            (translation) => {
                const value: unknown = translation[key];

                if (value === undefined || value === '' && !allowEmptyValues) {
                    return undefined;
                }

                return { value: String(value), translation };
            },
            notUndefined,
        );

        // Return the result or invoke the missing handler if no translation value was found in the specified translations.
        return result ?? {
            value: String(this.missingHandler.handle(
                key,
                {
                    activeLang: this.translocoService.getActiveLang(),
                    ...this.translocoService.config,
                },
            )),
            translation: translations[0] ?? {},
        };
    }
}

/**
 * Determines which language should be active given a sequence of streaming language specifiers. The active languages is resolved based on
 * the order of the language specifiers where the first non `undefined` language is emitted. If that language specifier does not specify a
 * static language (e.g. `'en|static'`), any changes from the downstream language specifiers will be allowed to 'override' the active
 * language.
 *
 * @param   languageSpecifiers An array of language specifier streams.
 * @returns                    An observable that emits the active language based in the language specifiers.
 */
function resolveLanguage(...languageSpecifiers: Observable<string | undefined>[]): Observable<string> {
    return languageSpecifiers.reduceRight<Observable<string>>(
        (downstreamLanguage$, languageSpecifier$) => languageSpecifier$.pipe(switchMap((languageSpecifier) => {
            if (languageSpecifier === undefined) {
                return downstreamLanguage$;
            }

            const [isStatic, language] = getPipeValue(languageSpecifier, 'static');

            return concat(
                of(language),
                isStatic ? EMPTY : downstreamLanguage$.pipe(skip(1)),
            );
        })),
        of(''),
    ).pipe(distinctUntilChanged());
}

/**
 * Retrieves the name of the specified Transloco scope.
 *
 * @param   scope Scope for which the name is to be returned.
 * @returns       Name of the specified scope or `undefined` if the scope itself is `undefined`.
 */
function getScopeName(scope: TranslocoScope): string | undefined {
    return typeof scope === 'object' ? scope.scope : scope;
}
/**
 * Determines the language path for the specified language and (optional) scope.
 *
 * @param  language Language identifier.
 * @param  scope    Scope name (optional).
 * @return          Language path.
 */
function getLanguagePath(language: string, scope?: string): string {
    return scope ? `${scope}/${language}` : language;
}

/**
 * Determines the `InlineLoader` for the specified scope (if it is defined).
 *
 * @param   scope Scope for which the `InlineLoader` is to be determined.
 * @returns       Inline loader for the specified scope or `undefined` if the scope does not define one.
 */
function getScopeInlineLoader(scope: TranslocoScope): InlineLoader | undefined {
    return typeof scope === 'object' ? scope.loader : undefined;
}
