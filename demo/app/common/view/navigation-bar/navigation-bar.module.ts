import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { NavigationBarComponent } from './navigation-bar.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
    ],
    declarations: [
        NavigationBarComponent,
    ],
    exports: [
        NavigationBarComponent,
    ],
})
export class NavigationBarModule { }
