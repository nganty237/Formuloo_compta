import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si la route est marquée comme réservée aux invités (ex: Login, Signup)
  const onlyGuests = route.data['onlyGuests'] === true;

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        // L'utilisateur est connecté
        if (onlyGuests) {
          // S'il tente d'aller sur une page "Guest Only", on le renvoie au Dashboard
          // Note : On pourrait affiner l'ID ENT-001 dynamiquement plus tard
          return router.createUrlTree(['/tenant/ENT-001/dashboard']);
        }
        return true;
      } else {
        // L'utilisateur n'est pas connecté
        if (onlyGuests) {
          // C'est un invité sur une page d'invité, tout est OK
          return true;
        }
        // Sinon, redirection vers le login
        return router.createUrlTree(['/auth/login']);
      }
    })
  );
};
