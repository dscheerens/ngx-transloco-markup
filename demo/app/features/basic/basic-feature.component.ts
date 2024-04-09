import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';
import { TranslocoMarkupComponent } from 'ngx-transloco-markup';

import { BASIC_FEATURE_TRANSLATION_KEYS } from './basic-feature-translation-keys';

@Component({
    selector: 'app-basic-feature',
    templateUrl: './basic-feature.component.html',
    styleUrls: ['./basic-feature.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        TranslocoModule,
        TranslocoMarkupComponent,
    ],
})
export class BasicFeatureComponent {
    public readonly formControls = {
        name: new FormControl('Timmy'),
    };

    public readonly TRANSLATIONS = BASIC_FEATURE_TRANSLATION_KEYS;
}
