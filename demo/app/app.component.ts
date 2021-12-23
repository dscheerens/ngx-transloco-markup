import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
    public availableLanguages!: string[];
    public activeLanguage$!: Observable<string>;

    constructor(
        private readonly translocoService: TranslocoService,
    ) { }

    public ngOnInit(): void {
        this.availableLanguages = this.translocoService.getAvailableLangs() as string[];
        this.activeLanguage$ = this.translocoService.langChanges$;
    }

    public selectLanguage(language: string): void {
        this.translocoService.setActiveLang(language);
    }
}
