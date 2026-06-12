import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/dashboard-container/dashboard-container.component')
        .then(m => m.DashboardContainerComponent),
    providers: [
      provideCharts(withDefaultRegisterables())
    ]
  }
];
