import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '',
        loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayoutComponent),
        children: [
            {
                path: 'login',
                loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
            }
        ]
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
            }
        ]
    },

    { path: '**', redirectTo: 'login' }
];