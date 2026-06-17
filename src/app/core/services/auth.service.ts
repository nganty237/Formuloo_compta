import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, throwError, switchMap, catchError, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { environment } from '@env/environment';

export type { User, UserRole };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_KEY = 'formuloo_user';
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

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

  login(email: string, password: string): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}`).pipe(
      switchMap(users => {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Si c'est un client sans companyId, on tente un rapprochement au login
          if (user.role === 'CLIENT' && !user.companyId) {
            return this.http.get<any[]>(`${this.apiUrl}/entreprises?emailContact=${user.email}`).pipe(
                map(companies => {
                    if (companies.length > 0) {
                        user.companyId = companies[0].id;
                        user.tenantId = companies[0].tenantId;
                        this.http.patch(`${this.apiUrl}/users/${user.id}`, { 
                            companyId: user.companyId,
                            tenantId: user.tenantId 
                        }).subscribe();
                    }
                    this.setCurrentUser(user);
                    return user;
                })
            );
          }
          this.setCurrentUser(user);
          return of(user);
        } else {
          return throwError(() => new Error('Identifiants incorrects ou compte inexistant'));
        }
      }),
      catchError(err => {
        console.error('Erreur login:', err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.AUTH_KEY);
    }
  }

  updateRole(role: UserRole): Observable<User> {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, role };
      return this.http.patch<User>(`${this.apiUrl}/users/${current.id}`, { role }).pipe(
        tap(() => this.setCurrentUser(updated))
      );
    }
    return throwError(() => new Error('Aucun utilisateur connecté'));
  }

  register(signupData: any, role: string): Observable<{ user: User, company: any }> {
    const tenantId = 'tenant-' + Math.floor(Math.random() * 1000000);
    const userId = 'u' + Math.floor(Math.random() * 1000000);
    
    // Création d'un nouvel espace de travail (tenant) vierge
    const newTenant = {
      id: tenantId,
      nom: signupData.organizationName || signupData.fullName || 'Nouveau Cabinet',
      pays: 'Non défini',
      devise: 'XOF',
      planTarifaire: 'FREE'
    };

    const userRole = this.mapOnboardingRoleToUserRole(role);

    // Création du nouvel utilisateur rattaché à ce tenant vierge
    const newUser: User = {
      id: userId,
      name: signupData.fullName,
      email: signupData.email,
      password: signupData.password,
      role: userRole,
      tenantId: tenantId
    };

    return this.http.post(`${this.apiUrl}/tenants`, newTenant).pipe(
      switchMap(() => this.http.post<User>(`${this.apiUrl}/users`, newUser)),
      switchMap(user => {
        if (userRole === 'CLIENT') {
          // Rapprochement automatique pour le client par email
          return this.http.get<any[]>(`${this.apiUrl}/entreprises?emailContact=${user.email}`).pipe(
              map(companies => {
                  if (companies.length > 0) {
                      user.companyId = companies[0].id;
                      user.tenantId = companies[0].tenantId;
                      // Mise à jour de l'utilisateur avec son companyId et le bon tenantId
                      this.http.patch(`${this.apiUrl}/users/${user.id}`, { 
                          companyId: user.companyId,
                          tenantId: user.tenantId 
                      }).subscribe();
                  }
                  return { user, company: companies[0] || null };
              })
          );
        }
        return of({ user, company: null });
      }),
      tap(({ user }) => this.setCurrentUser(user)),
      catchError(err => {
        console.error('Erreur lors de la création du compte', err);
        return throwError(() => new Error('Échec de la création du compte. Veuillez réessayer.'));
      })
    );
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    }
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
