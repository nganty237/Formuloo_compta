import { Routes } from '@angular/router';

export const accountingRoutes: Routes = [
    {
        path: '', 
        loadComponent: () => import('./pages/accounting-home/accounting-home').then(m => m.AccountingHomeComponent)
    },
    {
        path: 'new-entry',
        loadComponent: () => import('./pages/entry-from/entry-from').then(m => m.EntryFormComponent)
    },
    {
        path: 'entry',
        loadComponent: () => import('./pages/entry-from/entry-from').then(m => m.EntryFormComponent)
    }
];