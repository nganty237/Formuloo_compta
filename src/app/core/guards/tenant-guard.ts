import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';
import { CompanyService } from '../services/company.service';
import { map, of, catchError } from 'rxjs';

export const tenantGuard: CanActivateFn = (route, state) => {
  const tenantContext = inject(TenantContextService);
  const companyService = inject(CompanyService);
  const router = inject(Router);
  
  const companyId = route.paramMap.get('id');

  if (!companyId) {
    return router.createUrlTree(['/auth/login']);
  }

  return companyService.getCompanyById(companyId).pipe(
    map(company => {
      if (company) {
        tenantContext.selectCompany(company.id, company.nom, company.tenantId);
        return true;
      } else {
        return router.createUrlTree(['/auth/login']);
      }
    }),
    catchError(() => {
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};
