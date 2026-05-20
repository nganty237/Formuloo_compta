import { CanActivateFn } from '@angular/router';

export const tenantGuard: CanActivateFn = (route, state) => {
  return true;
};
