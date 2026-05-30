import { Routes } from "@angular/router";

export const invoicingRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: 'list',
        loadComponent: () => import('./pages/invoice-list/invoice-list').then(m => m.InvoiceListComponent)
    },
    {
        path: 'new',
        loadComponent: () => import('./pages/invoice-form/invoice-form').then(m => m.InvoiceFormComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./pages/invoice-details/invoice-details').then(m => m.InvoiceDetailsComponent)
    }
];