import { NgModule } from '@angular/core';

import { TranslocoMarkupComponent } from './transloco-markup.component';

/**
 * Module which exports the `<transloco>` markup component.
 */
@NgModule({
    imports: [TranslocoMarkupComponent],
    exports: [TranslocoMarkupComponent],
})
export class TranslocoMarkupModule {}
