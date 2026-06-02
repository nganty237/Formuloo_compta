import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, take } from 'rxjs';
import { User, UserRole } from '../models/user.model';

export type { User, UserRole };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_KEY = 'formuloo_user';
  private platformId = inject(PLATFORM_ID);
  
  // INITIALISATION : Démarrage à null pour le SSR
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Si on est sur le navigateur, on tente de récupérer l'utilisateur
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this.currentUserSubject.next(storedUser);
      }
    }
  }

  private getStoredUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const stored = localStorage.getItem(this.AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  // Méthode de simulation de login
  login(email: string, password: string) {
    console.log(`[AuthService] Tentative de connexion pour : ${email}`);
    
    // Simulation d'un utilisateur admin par défaut pour les tests
    const mockUser: User = { 
      id: 'user-1',
      name: 'Admin Cabinet',
      role: 'ADMIN',
      tenantId: 'tenant-1'
    };
    
    this.currentUserSubject.next(mockUser);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(mockUser));
    }
    return mockUser;
  }

  logout() {
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.AUTH_KEY);
    }
  }

  updateRole(role: UserRole): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, role };
      this.currentUserSubject.next(updated);
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(updated));
      }
    }
  }

  register(signupData: any, role: string) {
    console.log(`[AuthService] Inscription du rôle ${role}`, signupData);
    
    const newUser: User = {
      id: 'u' + Math.floor(Math.random() * 1000),
      name: signupData.fullName,
      role: this.mapOnboardingRoleToUserRole(role),
      tenantId: 'tenant-1' // Utilise tenant-1 par défaut pour la démo
    };
    
    this.currentUserSubject.next(newUser);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(newUser));
    }
    return newUser;
  }

  private mapOnboardingRoleToUserRole(role: string): UserRole {
    switch (role) {
      case 'cabinet': return 'ADMIN'; 
      case 'comptable': return 'COMPTABLE';
      case 'client': return 'CLIENT';
      default: return 'CLIENT';
    }
  }

  hasRole(expectedRole: UserRole | UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    if (user.role === 'SUPER_ADMIN') return true;

    if (Array.isArray(expectedRole)) {
      return expectedRole.includes(user.role);
    }
    return user.role === expectedRole;
  }
}
