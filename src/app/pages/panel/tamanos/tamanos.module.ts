import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TamanosRoutingModule } from './tamanos-routing.module';
import { TamanosComponent } from './tamanos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    TamanosComponent
  ],
  imports: [
    CommonModule,
    TamanosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class TamanosModule { }
