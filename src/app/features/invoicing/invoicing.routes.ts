import { Routes } from "@angular/router";
import { roleGuard } from "../../core/guards/role-guard";

export const invoicingRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: 'list',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE', 'CLIENT'] },
        loadComponent: () => import('./pages/invoice-list/invoice-list').then(m => m.InvoiceListComponent)
    },
    {
        path: 'new',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () => import('./pages/invoice-form/invoice-form').then(m => m.InvoiceFormComponent)
    },
    {
        path: ':id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () => import('./pages/invoice-details/invoice-details').then(m => m.InvoiceDetailsComponent)
    }
];
