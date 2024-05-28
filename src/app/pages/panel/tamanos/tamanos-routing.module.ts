import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TamanosComponent } from './tamanos.component';

const routes: Routes = [
  {
    path: '',
    component: TamanosComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TamanosRoutingModule { }
