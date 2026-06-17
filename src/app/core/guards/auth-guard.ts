import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CompanyService } from '../services/company.service';
import { map, take, switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const companyService = inject(CompanyService);
  const router = inject(Router);

  // Handle guest-only routes (e.g., login/register) to prevent logged-in users from re-authenticating
  const onlyGuests = route.data['onlyGuests'] === true;

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user) {
        if (onlyGuests) {
          // Si c'est un client rattaché, direct dashboard
          if (user.role === 'CLIENT' && user.companyId) {
              return of(router.createUrlTree([`/tenant/${user.companyId}/dashboard`]));
          }

          // Pour les autres ou client non rattaché, filtrage habituel
          return companyService.getCompanies(user.tenantId).pipe(
            map(userCompanies => {
              if (userCompanies.length > 0) {
                // Si client, on prend son dossier spécifique
                const targetId = user.role === 'CLIENT' ? user.companyId : userCompanies[0].id;
                return router.createUrlTree([`/tenant/${targetId || userCompanies[0].id}/dashboard`]);
              } else {
                return router.createUrlTree(['/select-dossier']);
              }
            })
          );
        }
        
        // Si connecté mais sur une page non-guest, vérifier si le client doit être redirigé vers son dossier
        const isSelectionPage = state.url.includes('/select-dossier');
        if (isSelectionPage && user.role === 'CLIENT' && user.companyId) {
            return of(router.createUrlTree([`/tenant/${user.companyId}/dashboard`]));
        }
        
        if (!isSelectionPage) {
            return companyService.getCompanies(user.tenantId).pipe(
                map(userCompanies => {
                    if (userCompanies.length === 0) {
                        return router.createUrlTree(['/select-dossier']);
                    }
                    return true;
                })
            );
        }
        
        return of(true);
      } else {
        if (onlyGuests) {
          return of(true);
        }
        return of(router.createUrlTree(['/auth/login']));
      }
    })
  );
};
