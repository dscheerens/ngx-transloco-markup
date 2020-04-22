import { ChangeDetectionStrategy, Component, ComponentRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { TRANSLOCO_LANG, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { observeProperty } from '../utils/observe-property';

import { InnerTranslationExamplesComponent } from './inner-translation-examples.component';

@Component({
    selector: 'app-translation-examples',
    template: '<ng-template [cdkPortalOutlet]="portal$ | async" (attached)="portalAttached($event)"></ng-template>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationExamplesComponent implements OnInit, OnDestroy {

    @Input() public inlineLang?: string;
    @Input() public providedLang?: string;
    @Input() public providedScope?: string;

    public portal$!: Observable<ComponentPortal<InnerTranslationExamplesComponent>>;

    private readonly subscriptions = new Subscription();
    private readonly portalRefSubject = new BehaviorSubject<ComponentRef<InnerTranslationExamplesComponent> | undefined>(undefined);

    constructor(
        private readonly injector: Injector
    ) { }

    public ngOnInit(): void {
        const inlineLang$ = observeProperty(this as TranslationExamplesComponent, 'inlineLang');
        const providedLang$ = observeProperty(this as TranslationExamplesComponent, 'providedLang');
        const providedScope$ = observeProperty(this as TranslationExamplesComponent, 'providedScope');

        this.portal$ = combineLatest([providedLang$, providedScope$]).pipe(
            map(([providedLang, providedScope]) => new ComponentPortal(InnerTranslationExamplesComponent, undefined, Injector.create({
                providers: [
                    ...(providedLang !== undefined ? [{ provide: TRANSLOCO_LANG, useValue: providedLang }] : []),
                    ...(providedScope !== undefined ? [{ provide: TRANSLOCO_SCOPE, useValue: providedScope }] : [])
                ],
                parent: this.injector
            })))
        );

        this.subscriptions.add(
            combineLatest([this.portalRefSubject, inlineLang$]).subscribe(([portalRef, inlineLang]) => {
                if (portalRef) {
                    portalRef.instance.inlineLang = inlineLang;
                }
            })
        );
    }

    public ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public portalAttached(portalRef: ComponentRef<InnerTranslationExamplesComponent>): void {
        this.portalRefSubject.next(portalRef);
    }

}
