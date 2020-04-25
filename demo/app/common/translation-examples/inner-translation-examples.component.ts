import { Component, ChangeDetectionStrategy, Input, OnInit, Optional, Inject } from '@angular/core';
import { TRANSLOCO_LANG, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { SubstitutionLinkTranspilerFactory, TranslationMarkupTranspiler } from 'ngx-transloco-markup';

@Component({
    selector: 'app-inner-translation-examples',
    templateUrl: './inner-translation-examples.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InnerTranslationExamplesComponent implements OnInit {
    @Input() public inlineLang?: string;

    public transpilers!: TranslationMarkupTranspiler[];

    constructor(
        @Optional() @Inject(TRANSLOCO_LANG) public readonly providedLang: string,
        @Optional() @Inject(TRANSLOCO_SCOPE) public readonly providedScope: string,
        private readonly substitutionLinkTranspilerFactory: SubstitutionLinkTranspilerFactory
    ) { }

    public ngOnInit(): void {
        this.transpilers = [
            this.substitutionLinkTranspilerFactory.create('[moment]', { label: { static: 'today' }, link: { static: 'http://what-time-is-it.com/' }})
        ];
    }
}
