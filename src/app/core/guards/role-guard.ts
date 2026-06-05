import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[];

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      // Allow access if no specific roles are required (AuthGuard still protects the route)
      if (!allowedRoles || allowedRoles.length === 0) {
        return true;
      }

      // SECURITY: SUPER_ADMIN bypasses all role checks; otherwise, explicit role membership is required
      const hasPermission = allowedRoles.includes(user.role) || user.role === 'SUPER_ADMIN';

      if (hasPermission) {
        return true;
      }

      // Log unauthorized access attempt for security monitoring
      console.warn(`[RoleGuard] Accès refusé à ${state.url} pour le rôle ${user.role}`);
      return router.createUrlTree(['/403']);
    })
  );
};
