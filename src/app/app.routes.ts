import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'detalle/:codigo',
    loadComponent: () => import('./pages/incidencia-detail/incidencia-detail.page').then((m) => m.IncidenciaDetailPage),
  },
];
