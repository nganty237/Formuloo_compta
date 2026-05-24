import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
    {
        path: '', // Correspondra à /tenant/:id/dashboard
        loadComponent: () => import('./pages/dashboard-home/dashboard-home').then(m => m.DashboardHomeComponent)
    }
];