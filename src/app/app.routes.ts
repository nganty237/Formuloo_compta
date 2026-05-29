import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
        path: 'auth',
        loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayoutComponent),
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'tenant/:id',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
            },
            {
                path: 'accounting',
                loadChildren: () => import('./features/accounting/accounting.routes').then(m => m.accountingRoutes)
            },
            {
                path: 'invoicing',
                loadChildren: () => import('./features/invoicing/invoicing.routes').then(m => m.invoicingRoutes)
            },
            {
                path: 'companies',
                loadComponent: () => import('./features/companies/companies-list/companies-list').then(m => m.CompaniesListComponent)
            }
        ]
    },

    { path: '**', redirectTo: '/auth/login' }
];
