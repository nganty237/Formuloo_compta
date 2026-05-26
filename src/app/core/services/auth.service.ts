import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'ADMIN' | 'COMPTABLE' | 'CLIENT';

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

  // Méthode utile pour la directive
  hasRole(expectedRole: UserRole | UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    if (Array.isArray(expectedRole)) {
      return expectedRole.includes(user.role);
    }
    return user.role === expectedRole;
  }
}