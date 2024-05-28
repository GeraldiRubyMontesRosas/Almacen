import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel.component';

const routes: Routes = [
  {
    path: '',
    component: PanelComponent,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadChildren: () =>
          import('./inicio/inicio.module').then((i) => i.InicioModule),
      },
      {
        path: 'Tallas',
        loadChildren: () =>
          import('./tamanos/tamanos.module').then((i) => i.TamanosModule),
      },

      {
        path: 'Inmuebles',
        loadChildren: () =>
          import('./inmuebles/inmuebles.module').then((i) => i.InmueblesModule),
      },
      {
        path: 'Area',
        loadChildren: () =>
          import('./area/area.module').then((i) => i.AreaModule),
      },
      {
        path: 'Scanner',
        loadChildren: () =>
          import('./scanner/scanner.module').then((i) => i.ScannerModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelRoutingModule {}
