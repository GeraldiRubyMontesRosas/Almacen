import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrasladosRoutingModule } from './traslados-routing.module';
import { TrasladosComponent } from './traslados.component';


@NgModule({
  declarations: [
    TrasladosComponent
  ],
  imports: [
    CommonModule,
    TrasladosRoutingModule
  ]
})
export class TrasladosModule { }
