import { Routes } from '@angular/router';

export const accountingRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/accounting-home/accounting-home').then(m => m.AccountingHomeComponent)
    },
    {
        path: 'entry',
        loadComponent: () => import('./pages/entry-from/entry-from').then(m => m.EntryFormComponent)
    }
];