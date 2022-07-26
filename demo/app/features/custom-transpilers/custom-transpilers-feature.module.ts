import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@ngneat/transloco';
import { TranslocoMarkupModule } from 'ngx-transloco-markup';

import { CustomTranspilersFeatureComponent } from './custom-transpilers-feature.component';

@NgModule({
    imports: [
        CommonModule,
        MatCardModule,
        TranslocoModule,
        TranslocoMarkupModule,
    ],
    declarations: [
        CustomTranspilersFeatureComponent,
    ],
    exports: [
        CustomTranspilersFeatureComponent,
    ],
})
export class CustomTranspilersFeatureModule {}
