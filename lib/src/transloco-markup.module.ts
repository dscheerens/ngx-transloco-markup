import { NgModule } from '@angular/core';

import { TranslocoMarkupComponent } from './transloco-markup.component';

/**
 * Module which exports the `<transloco>` markup component.
 */
@NgModule({
    declarations: [TranslocoMarkupComponent],
    exports: [TranslocoMarkupComponent]
})
export class TranslocoMarkupModule { }
