import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { TranslocoMarkupModule } from 'ngx-transloco-markup';

import { BasicFeatureComponent } from './basic-feature.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        TranslocoModule,
        TranslocoMarkupModule,
    ],
    declarations: [
        BasicFeatureComponent,
    ],
    exports: [
        BasicFeatureComponent,
    ],
})
export class BasicFeatureModule { }
