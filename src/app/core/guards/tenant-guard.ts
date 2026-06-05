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

  // Cross-reference company existence and user tenant affiliation to prevent unauthorized cross-tenant access
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

          // SECURITY: Ensure user belongs to the same tenant as the company, or has SUPER_ADMIN privileges
          const isAllowed = user.role === 'SUPER_ADMIN' || company.tenantId === user.tenantId;

          if (isAllowed) {
            tenantContext.selectCompany(company.id, company.nom, company.tenantId);
            return true;
          } else {
            // Log security violation for audit purposes
            console.error(`[TenantGuard] Violation d'accès : L'utilisateur ${user.id} tente d'accéder à l'entreprise ${company.id} d'un autre tenant.`);
            return router.createUrlTree(['/403']);
          }
        }),
        catchError(() => of(router.createUrlTree(['/auth/login'])))
      );
    })
  );
};
