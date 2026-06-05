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
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this.currentUserSubject.next(storedUser);
      }
    }
  }

  private getStoredUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const stored = sessionStorage.getItem(this.AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  login(email: string, password: string) {
    // Hardcoded mock user for testing authentication flow without a backend
    const mockUser: User = { 
      id: 'user-1',
      name: 'Admin Cabinet',
      role: 'ADMIN',
      tenantId: 'tenant-1'
    };
    
    this.currentUserSubject.next(mockUser);
    
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(mockUser));
    }
    return mockUser;
  }

  logout() {
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.AUTH_KEY);
    }
  }

  updateRole(role: UserRole): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, role };
      this.currentUserSubject.next(updated);
      
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(updated));
      }
    }
  }

  register(signupData: any, role: string) {
    const newUser: User = {
      id: 'u' + Math.floor(Math.random() * 1000),
      name: signupData.fullName,
      role: this.mapOnboardingRoleToUserRole(role),
      // Defaulting to tenant-1 for demo purposes until multi-tenant creation is implemented
      tenantId: 'tenant-1'
    };
    
    this.currentUserSubject.next(newUser);
    
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(newUser));
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
