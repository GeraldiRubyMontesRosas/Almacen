import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScannerRoutingModule } from './scanner-routing.module';
import { ScannerComponent } from './scanner.component';


@NgModule({
  declarations: [
    ScannerComponent
  ],
  imports: [
    CommonModule,
    ScannerRoutingModule
  ]
})
export class ScannerModule { }
