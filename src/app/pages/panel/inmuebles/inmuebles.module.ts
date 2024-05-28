import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InmueblesRoutingModule } from './inmuebles-routing.module';
import { InmueblesComponent } from './inmuebles.component';


@NgModule({
  declarations: [
    InmueblesComponent
  ],
  imports: [
    CommonModule,
    InmueblesRoutingModule
  ]
})
export class InmueblesModule { }
