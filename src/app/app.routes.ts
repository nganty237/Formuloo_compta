import { Routes } from '@angular/router';
import { authGuard, tenantGuard, roleGuard } from '@core';

export const routes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./layout/landing-layout/landing-layout').then(m => m.LandingLayoutComponent),
        canActivate: [authGuard],
        data: { onlyGuests: true },
        children: [
            {
                path: '',
                loadComponent: () => import('./features/landing/landing-page/landing-page').then(m => m.LandingPageComponent)
            }
        ]
    },
    {
        path: 'auth',
        loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayoutComponent),
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: '403',
        loadComponent: () => import('./features/auth/pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
    },
    {
        path: 'tenant/:id',
        canActivate: [authGuard, tenantGuard],
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
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'COMPTABLE'] },
                loadComponent: () => import('./features/companies/companies-list/companies-list').then(m => m.CompaniesListComponent)
            }
        ]
    },

    { path: '**', redirectTo: '/auth/login' }
];
