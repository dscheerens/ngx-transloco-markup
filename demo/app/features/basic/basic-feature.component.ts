import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from 'ngx-typesafe-forms';

import { BASIC_FEATURE_TRANSLATION_KEYS } from './basic-feature-translation-keys';

@Component({
    selector: 'app-basic-feature',
    templateUrl: './basic-feature.component.html',
    styleUrls: ['./basic-feature.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicFeatureComponent {

    public readonly formControls = {
        name: new FormControl('Timmy')
    };

    public readonly TRANSLATIONS = BASIC_FEATURE_TRANSLATION_KEYS;

}
