import { Routes } from '@angular/router';

export const invoicingRoutes: Routes = [
    {
        path: '', // Correspondra à /tenant/:id/invoicing
        loadComponent: () => import('./pages/invoice-form/invoice-form').then(m => m.InvoiceFormComponent)
    }
];