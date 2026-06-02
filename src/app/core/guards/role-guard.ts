import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer les rôles autorisés depuis les données de la route
  const allowedRoles = route.data['roles'] as UserRole[];

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      // Si aucun rôle n'est spécifié, on laisse passer par défaut (mais protégé par AuthGuard normalement)
      if (!allowedRoles || allowedRoles.length === 0) {
        return true;
      }

      // Vérifier si le rôle de l'utilisateur est dans la liste autorisée
      const hasPermission = allowedRoles.includes(user.role) || user.role === 'SUPER_ADMIN';

      if (hasPermission) {
        return true;
      }

      // En cas de refus, redirection vers le dashboard par défaut avec un avertissement (potentiel)
      console.warn(`[RoleGuard] Accès refusé à ${state.url} pour le rôle ${user.role}`);
      return router.createUrlTree(['/tenant/ENT-001/dashboard']);
    })
  );
};
