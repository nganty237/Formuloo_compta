import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';
import { first, switchMap } from 'rxjs';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantContext = inject(TenantContextService);
  
  const tenantId = tenantContext.tenantId;
  const companyId = tenantContext.companyId;

  let headers = req.headers;
  if (tenantId) {
    headers = headers.set('X-Tenant-Id', tenantId);
  }
  if (companyId) {
    headers = headers.set('X-Company-Id', companyId);
  }

  const modifiedReq = req.clone({ headers });
  return next(modifiedReq);
};
