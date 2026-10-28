import type { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'incidencias',
        loadComponent: () => import('../pages/incidencias-list/incidencias-list.page').then((m) => m.IncidenciasListPage),
      },
      {
        path: 'seguimiento',
        loadComponent: () => import('../pages/seguimiento-list/seguimiento-list.page').then((m) => m.SeguimientoListPage),
      },
      {
        path: 'nueva',
        loadComponent: () => import('../pages/incidencia-form/incidencia-form.page').then((m) => m.IncidenciaFormPage),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];
