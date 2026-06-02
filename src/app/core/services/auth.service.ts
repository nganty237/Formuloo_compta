import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COMPTABLE' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // INITIALISATION À NULL : Pour permettre de tester le flux de connexion/onboarding
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

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
    return mockUser;
  }

  logout() {
    this.currentUserSubject.next(null);
  }

  updateRole(role: UserRole): void {
    const current = this.currentUserSubject.value;
    if (current) {
      this.currentUserSubject.next({ ...current, role });
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
