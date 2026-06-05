import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import {  environment  } from '@env/environment';

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

  // Signaux pour l'état dynamique - Initialisé avec des valeurs par défaut pour éviter l'écran vide
  private defaultRoles: RoleConfig[] = [
    { id: 'cabinet', title: 'Cabinet Comptable', description: 'Gérez plusieurs clients et vos collaborateurs.', icon: 'building' },
    { id: 'client', title: 'Entreprise / Client', description: 'Suivez votre comptabilité et collaborez avec votre expert.', icon: 'users' },
    { id: 'comptable', title: 'Comptable Indépendant', description: 'Travaillez sur vos dossiers en toute autonomie.', icon: 'briefcase' }
  ];

  private _availableRoles = signal<RoleConfig[]>(this.defaultRoles);
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
