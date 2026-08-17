import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          ),
      },
      {
        path: 'crud',
        loadComponent: () =>
          import('./pages/crud/crud-page.component').then(
            (m) => m.CrudPageComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings-page.component').then(
            (m) => m.SettingsPageComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
