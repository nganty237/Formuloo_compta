import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';
import { CompanyService } from '../services/company.service';
import { AuthService } from '../services/auth.service';
import { map, of, catchError, switchMap, take } from 'rxjs';

export const tenantGuard: CanActivateFn = (route, state) => {
  const tenantContext = inject(TenantContextService);
  const companyService = inject(CompanyService);
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const companyId = route.paramMap.get('id');

  if (!companyId) {
    return router.createUrlTree(['/auth/login']);
  }

  // Double vérification : Existence de l'entreprise + Appartenance au Tenant de l'utilisateur
  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        return of(router.createUrlTree(['/auth/login']));
      }

      return companyService.getCompanyById(companyId).pipe(
        map(company => {
          if (!company) {
            return router.createUrlTree(['/auth/login']);
          }

          // LE POINT CRITIQUE : L'utilisateur a-t-il le droit d'accéder à ce tenant ?
          // Le Super Admin bypass, sinon on compare les tenantId
          const isAllowed = user.role === 'SUPER_ADMIN' || company.tenantId === user.tenantId;

          if (isAllowed) {
            tenantContext.selectCompany(company.id, company.nom, company.tenantId);
            return true;
          } else {
            console.error(`[TenantGuard] Violation d'accès : L'utilisateur ${user.id} tente d'accéder à l'entreprise ${company.id} d'un autre tenant.`);
            // Redirection vers la racine (évite la boucle infinie sur ENT-001)
            return router.createUrlTree(['/']);
          }
        }),
        catchError(() => of(router.createUrlTree(['/auth/login'])))
      );
    })
  );
};
