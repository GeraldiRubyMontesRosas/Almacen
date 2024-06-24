import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrasladosComponent } from './traslados.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component : TrasladosComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessTraslados'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrasladosRoutingModule { }
