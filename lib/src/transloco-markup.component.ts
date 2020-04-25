import { ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnDestroy, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { TRANSLOCO_LANG, TRANSLOCO_SCOPE, HashMap, MaybeArray, TranslocoScope, TranslocoService, InlineLoader } from '@ngneat/transloco';
import { Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { StringLiteralTranspiler } from './transpilers/string-literal-transpiler';
import { asArray } from './utils/array';
import { observeProperty } from './utils/observe-property';
import { createTranslationMarkupRenderer } from './create-translation-markup-renderer';
import { STRING_INTERPOLATION_TRANSPILER } from './string-interpolation-transpiler.token';
import { TranslationMarkupTranspiler } from './translation-markup-transpiler.model';
import { TRANSLATION_MARKUP_TRANSPILER } from './translation-markup-transpiler.token';

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

        const language$ = combineLatest([inlineLanguage$, this.translocoService.langChanges$]).pipe(
            // TODO: obey to the (bugged?) Transloco language resolution rules.
            map(([inlineLanguage, activeLanguage]) => getLanguageName(inlineLanguage || this.providedLanguage || activeLanguage)),
            distinctUntilChanged()
        );

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
            map(([key, translation]) => ({
                translation,
                key,
                value: String(key && translation[key] || key) // TODO: handle missing translations.
            }))
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
}

function getLanguageName(language: string): string {
    return language.split('|')[0];
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
