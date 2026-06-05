import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 text-center">
        <div>
          <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
            <svg class="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accès Refusé
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
        </div>
        <div class="mt-8 space-y-4">
          <button
            (click)="goBack()"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Retourner au tableau de bord
          </button>
          <a
            routerLink="/auth/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Se connecter avec un autre compte
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .bg-primary-600 { background-color: #2563eb; }
    .hover\:bg-primary-700:hover { background-color: #1d4ed8; }
    .text-primary-600 { color: #2563eb; }
    .hover\:text-primary-500:hover { color: #3b82f6; }
  `]
})
export class AccessDeniedComponent {
  private router = inject(Router);

  goBack() {
    // Redirection vers la racine, les guards redirigeront l'utilisateur vers son dashboard légitime
    this.router.navigate(['/']);
  }
}
