import { Routes } from '@angular/router';

export const accountingRoutes: Routes = [
    {
        path: '', // Correspondra à /tenant/:id/accounting
        loadComponent: () => import('./pages/accounting-home/accounting-home').then(m => m.AccountingHomeComponent)
    }
];