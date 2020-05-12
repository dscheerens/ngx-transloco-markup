import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

interface LanguageOption {
    languageId: string;
    icon: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    { languageId: 'en', icon: 'gb.svg' },
    { languageId: 'nl', icon: 'nl.svg' }
];

@Component({
    selector: 'app-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarComponent implements OnInit {

    public activeLanguage$!: Observable<string>;

    public readonly languageOptions = LANGUAGE_OPTIONS;

    constructor(
        private readonly translocoService: TranslocoService
    ) { }

    public ngOnInit(): void {
        this.activeLanguage$ = this.translocoService.langChanges$;
    }

    public setActiveLanguage(language: string): void {
        this.translocoService.setActiveLang(language);
    }

}
