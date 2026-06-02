import { Routes } from '@angular/router';

import { authGuard } from '@core';

export const authRoutes: Routes = [
    {
        path: 'login',
        canActivate: [authGuard],
        data: { onlyGuests: true },
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        canActivate: [authGuard],
        data: { onlyGuests: true },
        loadComponent: () => import('./pages/register-container/register-container').then(m => m.RegisterContainerComponent),
        children: [
            {
                path: 'type',
                loadComponent: () => import('./pages/role-selection/role-selection').then(m => m.RoleSelectionComponent)
            },
            {
                path: 'form',
                loadComponent: () => import('./pages/signup/signup').then(m => m.SignupComponent)
            },
            {
                path: '',
                redirectTo: 'type',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'signup',
        redirectTo: 'register/type',
        pathMatch: 'full'
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];