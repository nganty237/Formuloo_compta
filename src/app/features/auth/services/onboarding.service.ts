import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type OnboardingRole = 'cabinet' | 'client' | 'comptable';

export interface RoleConfig {
  id: OnboardingRole;
  title: string;
  description: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Signaux pour l'état dynamique - Initialisé vide
  private _availableRoles = signal<RoleConfig[]>([]);
  readonly availableRoles = this._availableRoles.asReadonly();

  private _selectedRole = signal<OnboardingRole | null>(null);
  readonly selectedRole = this._selectedRole.asReadonly();

  constructor() {
    this.loadRoles();
  }

  private loadRoles() {
    this.http.get<RoleConfig[]>(`${this.apiUrl}/onboarding_roles`).pipe(
      tap(roles => this._availableRoles.set(roles)),
      catchError((error) => {
        console.error('[OnboardingService] Erreur critique : Impossible de charger les rôles.', error);
        return of([]);
      })
    ).subscribe();
  }

  setRole(role: OnboardingRole) {
    this._selectedRole.set(role);
  }

  clearRole() {
    this._selectedRole.set(null);
  }
}
