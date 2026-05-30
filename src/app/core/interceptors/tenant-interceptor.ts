import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';
import { first, switchMap } from 'rxjs';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantContext = inject(TenantContextService);
  
  // Note: Since interceptors are often synchronous or need to handle the request immediately,
  // we can't easily wait for an observable without potentially delaying the request.
  // However, for this prototype, we'll try to get the current values.
  
  let tenantId: string | null = null;
  let companyId: string | null = null;

  // We use a small trick to get current values if available
  tenantContext.tenantId$.pipe(first()).subscribe(id => tenantId = id);
  tenantContext.companyId$.pipe(first()).subscribe(id => companyId = id);

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
