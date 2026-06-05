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
          // Redirect authenticated users to their primary dashboard instead of guest pages
          return companyService.getCompanies().pipe(
            map(companies => {
              const userCompanies = companies.filter(c => c.tenantId === user.tenantId);

              if (userCompanies.length > 0) {
                return router.createUrlTree([`/tenant/${userCompanies[0].id}/dashboard`]);
              } else {
                // Fallback for edge case where a user exists without an associated company
                console.warn('[AuthGuard] Aucune entreprise trouvée pour le tenant', user.tenantId);
                return router.createUrlTree(['/auth/login']);
              }
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
