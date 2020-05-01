import { ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnDestroy, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import {
    TRANSLOCO_LANG,
    TRANSLOCO_MISSING_HANDLER,
    TRANSLOCO_SCOPE,
    HashMap,
    MaybeArray,
    Translation,
    TranslocoMissingHandler,
    TranslocoScope,
    TranslocoService,
    InlineLoader,
    getPipeValue,
} from '@ngneat/transloco';
import { Subscription, combineLatest, Observable, of, concat, EMPTY } from 'rxjs';
import { distinctUntilChanged, map, switchMap, first, skip, shareReplay } from 'rxjs/operators';

import { StringLiteralTranspiler } from './transpilers/string-literal-transpiler';
import { asArray } from './utils/array';
import { observeProperty } from './utils/observe-property';
import { createTranslationMarkupRenderer } from './create-translation-markup-renderer';
import { STRING_INTERPOLATION_TRANSPILER } from './string-interpolation-transpiler.token';
import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';
import { selectFirstWhere } from './utils/iterable';
import { notUndefined } from './utils/predicates';

// tslint:disable:component-selector use-component-view-encapsulation no-input-rename
@Component({
    selector: 'transloco',
    template: '',
    styles: [':host { display: inline; }'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TranslocoMarkupComponent implements OnInit, OnDestroy {

    @Input('key') public translationKey?: string;
    @Input('params') public translationParameters?: HashMap;
    @Input('lang') public inlineLanguage?: string;
    @Input('scope') public inlineScope?: string;
    @Input('transpilers') public inlineTranspilers?: MaybeArray<TranslationMarkupTranspiler>;
    @Input() public mergeTranspilers?: boolean;

    private readonly subscriptions = new Subscription();

    constructor(
        private readonly hostElement: ElementRef<HTMLElement>,
        private readonly translocoService: TranslocoService,
        @Inject(TRANSLOCO_MISSING_HANDLER) private readonly missingHandler: TranslocoMissingHandler,
        @Optional() @Inject(TRANSLOCO_SCOPE) private readonly providedScope: MaybeArray<TranslocoScope> | null,
        @Optional() @Inject(TRANSLOCO_LANG) private readonly providedLanguage: string | null,
        @Optional() @Inject(TRANSLATION_MARKUP_TRANSPILER) private readonly providedTranspilers: MaybeArray<TranslationMarkupTranspiler> | null, // tslint:disable-line:max-line-length
        @Inject(STRING_INTERPOLATION_TRANSPILER) private readonly stringInterpolationTranspiler: TranslationMarkupTranspiler,
        private readonly stringLiteralTranspiler: StringLiteralTranspiler
    ) { }

    public ngOnInit(): void {
        this.translocoService.selectTranslation();

        const translationKey$ = observeProperty(this as TranslocoMarkupComponent, 'translationKey');
        const translationParameters$ = observeProperty(this as TranslocoMarkupComponent, 'translationParameters');
        const inlineLanguage$ = observeProperty(this as TranslocoMarkupComponent, 'inlineLanguage');
        const inlineScope$ = observeProperty(this as TranslocoMarkupComponent, 'inlineScope');
        const inlineTranspilers$ = observeProperty(this as TranslocoMarkupComponent, 'inlineTranspilers');
        const mergeTranspilers$ = observeProperty(this as TranslocoMarkupComponent, 'mergeTranspilers').pipe(
            map((mergeTranspilers) => mergeTranspilers !== false)
        );

        const langChanges$ = this.translocoService.langChanges$;

        const activeLanguage$ = this.translocoService.config.reRenderOnLangChange ? langChanges$ : langChanges$.pipe(
            first(),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        const language$ = resolveLanguage(inlineLanguage$, of(this.providedLanguage || undefined), activeLanguage$);

        const scopes$ = inlineScope$.pipe(
            map((inlineScope) => inlineScope || this.providedScope),
            distinctUntilChanged(),
            map((scope) => Array.isArray(scope) ? scope : [!!scope ? scope : undefined])
        );

        const translation$ = combineLatest([language$, scopes$]).pipe(
            switchMap(([language, scopes]) =>
                combineLatest(scopes.map((scope) => {
                    const scopeName = getScopeName(scope);
                    const path = getLanguagePath(language, scopeName);
                    const inlineLoader = getScopeInlineLoader(scope);

                    return this.translocoService._loadDependencies(path, inlineLoader);
                })).pipe(
                    map(() => this.translocoService.getTranslation(language))
                )
            )
        );

        const translationText$ = combineLatest([translationKey$, translation$]).pipe(
            map(([key, translation]) => {
                if (key === undefined) {
                    return { value: '', translation };
                }

                const useFallbackTranslation = this.translocoService.config.missingHandler!.useFallbackTranslation || false;
                const firstFallbackLanguage = asArray(this.translocoService.config.fallbackLang || [])[0];
                const fallbackTranslation =
                    useFallbackTranslation && firstFallbackLanguage ? [this.translocoService.getTranslation(firstFallbackLanguage)] : [];

                return this.getTranslationValue(key, [translation, ...fallbackTranslation]);
            })
        );

        const transpilers$ = combineLatest([inlineTranspilers$, mergeTranspilers$]).pipe(
            map(([inlineTranspilers, mergeTranspilers]) => [
                ...(inlineTranspilers ? asArray(inlineTranspilers) : []),
                ...(this.providedTranspilers && (!inlineTranspilers || mergeTranspilers) ? asArray(this.providedTranspilers) : []),
                this.stringInterpolationTranspiler,
                this.stringLiteralTranspiler
            ])
        );

        const render$ = combineLatest([translationText$, transpilers$]).pipe(
            map(([{ translation, value }, transpilers]) => createTranslationMarkupRenderer(value, transpilers, translation))
        );

        this.subscriptions.add(combineLatest([render$, translationParameters$]).subscribe(
            ([render, translationParameters]) => render(this.hostElement.nativeElement, translationParameters || {})
        ));
    }

    public ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private getTranslationValue(key: string, translations: Translation[]): { value: string; translation: Translation } {
        const allowEmptyValues = this.translocoService.config.missingHandler!.allowEmpty;

        const result = selectFirstWhere(
            translations,
            (translation) => {
                const value = translation[key];

                if (value === undefined || value === '' && !allowEmptyValues) {
                    return undefined;
                }

                return { value: String(value), translation };
            },
            notUndefined
        );

        return result || {
            value: this.missingHandler.handle(
                key,
                {
                    activeLang: this.translocoService.getActiveLang(),
                    ...this.translocoService.config
                }
            ),
            translation: translations[0]
        };
    }
}

function resolveLanguage(...languageSpecifiers: Observable<string | undefined>[]): Observable<string> {
    return languageSpecifiers.reduceRight<Observable<string>>(
        (downstreamLanguage$, languageSpecifier$) => languageSpecifier$.pipe(switchMap((languageSpecifier) => {
            if (languageSpecifier === undefined) {
                return downstreamLanguage$;
            }

            const [isStatic, language] = getPipeValue(languageSpecifier, 'static');

            return concat(
                of(language),
                isStatic ? EMPTY : downstreamLanguage$.pipe(skip(1))
            );
        })),
        of('')
    ).pipe(distinctUntilChanged());
}

function getScopeName(scope: TranslocoScope): string | undefined {
    return typeof scope === 'object' ? scope.scope : scope;
}

function getLanguagePath(language: string, scope?: string): string {
    return scope ? `${scope}/${language}` : language;
}

function getScopeInlineLoader(scope: TranslocoScope): InlineLoader | undefined {
    return typeof scope === 'object' ? scope.loader : undefined;
}
