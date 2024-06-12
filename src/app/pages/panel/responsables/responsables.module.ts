import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsablesRoutingModule } from './responsables-routing.module';
import { ResponsablesComponent } from './responsables.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ResponsablesComponent
  ],
  imports: [
    CommonModule,
    ResponsablesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class ResponsablesModule { }
