import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COMPTABLE' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Simule un utilisateur connecté (par défaut : Comptable)
  private currentUserSubject = new BehaviorSubject<User>({ 
    id: 'u1',
    name: 'Jean Comptable',
    role: 'COMPTABLE'
  });
  
  public currentUser$ = this.currentUserSubject.asObservable();

  updateRole(role: UserRole): void {
    this.currentUserSubject.next({
      ...this.currentUserSubject.value,
      role
    });
  }

  // Méthode utile pour la directive
  hasRole(expectedRole: UserRole | UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Super Admin a tous les droits
    if (user.role === 'SUPER_ADMIN') return true;

    if (Array.isArray(expectedRole)) {
      return expectedRole.includes(user.role);
    }
    return user.role === expectedRole;
  }
}