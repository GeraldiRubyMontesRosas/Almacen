import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResponsablesComponent } from './responsables.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ResponsablesComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessResponsable'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResponsablesRoutingModule { }
