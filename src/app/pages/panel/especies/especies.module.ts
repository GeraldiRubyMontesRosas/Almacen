import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EspeciesRoutingModule } from './especies-routing.module';
import { EspeciesComponent } from './especies.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    EspeciesComponent
  ],
  imports: [
    CommonModule,
    EspeciesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class EspeciesModule { }
