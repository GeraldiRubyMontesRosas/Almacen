import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrasladosRoutingModule } from './traslados-routing.module';
import { TrasladosComponent } from './traslados.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule  } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    TrasladosComponent
  ],
  imports: [
    CommonModule,
    TrasladosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    SharedModule
  ]
})
export class TrasladosModule { }
