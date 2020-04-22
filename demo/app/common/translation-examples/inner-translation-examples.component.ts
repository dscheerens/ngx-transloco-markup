import { Component, ChangeDetectionStrategy, Input, Optional, Inject } from '@angular/core';
import { TRANSLOCO_LANG, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { defaultTranslocoMarkupTranspilers } from 'ngx-transloco-markup';

@Component({
    selector: 'app-inner-translation-examples',
    templateUrl: './inner-translation-examples.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        defaultTranslocoMarkupTranspilers()
    ]
})
export class InnerTranslationExamplesComponent {
    @Input() public inlineLang?: string;

    constructor(
        @Optional() @Inject(TRANSLOCO_LANG) public readonly providedLang: string,
        @Optional() @Inject(TRANSLOCO_SCOPE) public readonly providedScope: string,
    ) { }
}
