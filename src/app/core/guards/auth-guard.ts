import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CompanyService } from '../services/company.service';
import { map, take, switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const companyService = inject(CompanyService);
  const router = inject(Router);

  // Vérifier si la route est marquée comme réservée aux invités (ex: Login, Signup)
  const onlyGuests = route.data['onlyGuests'] === true;

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user) {
        // L'utilisateur est connecté
        if (onlyGuests) {
          // S'il tente d'aller sur une page "Guest Only", on le renvoie au Dashboard
          // Récupérer les entreprises via Observable pour attendre le chargement
          return companyService.getCompanies().pipe(
            map(companies => {
              const userCompanies = companies.filter(c => c.tenantId === user.tenantId);

              if (userCompanies.length > 0) {
                // Rediriger vers la première entreprise du tenant
                return router.createUrlTree([`/tenant/${userCompanies[0].id}/dashboard`]);
              } else {
                // Si pas d'entreprise pour ce tenant, rediriger vers login
                console.warn('[AuthGuard] Aucune entreprise trouvée pour le tenant', user.tenantId);
                return router.createUrlTree(['/auth/login']);
              }
            })
          );
        }
        return of(true);
      } else {
        // L'utilisateur n'est pas connecté
        if (onlyGuests) {
          // C'est un invité sur une page d'invité, tout est OK
          return of(true);
        }
        // Sinon, redirection vers le login
        return of(router.createUrlTree(['/auth/login']));
      }
    })
  );
};
