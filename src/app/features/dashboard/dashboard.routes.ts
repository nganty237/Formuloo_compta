import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/dashboard-container/dashboard-container.component')
        .then(m => m.DashboardContainerComponent)
  }
];
