import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InmueblesRoutingModule } from './inmuebles-routing.module';
import { InmueblesComponent } from './inmuebles.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule  } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    InmueblesComponent
  ],
  imports: [
    CommonModule,
    InmueblesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class InmueblesModule { }
