import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';
import { tenantGuard } from './tenant-guard';
import { roleGuard } from './role-guard';
import { AuthService, User } from '../services/auth.service';
import { CompanyService } from '../services/company.service';
import { TenantContextService } from '../services/tenant-context.service';
import { RouterStateSnapshot } from '@angular/router';

describe('Security Verification', () => {
  let authServiceSpy: any;
  let companyServiceSpy: any;
  let tenantContextSpy: any;
  let routerSpy: any;

  beforeEach(() => {
    authServiceSpy = {
      currentUser$: of(null),
      hasRole: (role: any) => false
    };
    companyServiceSpy = {
      getCompanyById: (id: string) => of(null)
    };
    tenantContextSpy = {
      selectCompany: (id: string, name: string, tenantId?: string) => {}
    };
    routerSpy = {
      createUrlTree: (commands: any[]) => ({}) as UrlTree
    };

    // Use jest-like spying if available, or just manually track
    tenantContextSpy.selectCompany = (id: string, name: string, tenantId?: string) => {
        tenantContextSpy.lastSelected = { id, name, tenantId };
    };
    routerSpy.createUrlTree = (commands: any[]) => {
        routerSpy.lastUrlTree = commands;
        return { commands } as unknown as UrlTree;
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: TenantContextService, useValue: tenantContextSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  describe('Tenant Isolation (tenantGuard)', () => {
    it('should allow access if user tenantId matches company tenantId', async () => {
      const mockUser: User = { id: 'u1', name: 'User 1', role: 'ADMIN', tenantId: 'tenant-1' };
      const mockCompany = { id: 'ENT-001', nom: 'Company 1', tenantId: 'tenant-1' };
      
      authServiceSpy.currentUser$ = of(mockUser);
      companyServiceSpy.getCompanyById = (id: string) => of(mockCompany as any);

      const route = { paramMap: { get: () => 'ENT-001' } } as any;

      const result = await TestBed.runInInjectionContext(() => {
        return firstValueFrom(tenantGuard(route, {} as RouterStateSnapshot) as any);
      });

      expect(result).toBe(true);
      expect(tenantContextSpy.lastSelected).toEqual({ id: 'ENT-001', name: 'Company 1', tenantId: 'tenant-1' });
    });

    it('should DENY access if user tenantId DOES NOT match company tenantId', async () => {
      const mockUser: User = { id: 'u1', name: 'User 1', role: 'ADMIN', tenantId: 'tenant-1' };
      const mockCompany = { id: 'ENT-003', nom: 'Company 3', tenantId: 'tenant-2' };
      
      authServiceSpy.currentUser$ = of(mockUser);
      companyServiceSpy.getCompanyById = (id: string) => of(mockCompany as any);

      const route = { paramMap: { get: () => 'ENT-003' } } as any;

      const result = await TestBed.runInInjectionContext(() => {
        return firstValueFrom(tenantGuard(route, {} as RouterStateSnapshot) as any);
      });

      expect(result).not.toBe(true);
      expect(routerSpy.lastUrlTree).toEqual(['/']);
    });

    it('should allow SUPER_ADMIN to access any company', async () => {
      const mockUser: User = { id: 'u0', name: 'Super Admin', role: 'SUPER_ADMIN', tenantId: null };
      const mockCompany = { id: 'ENT-003', nom: 'Company 3', tenantId: 'tenant-2' };
      
      authServiceSpy.currentUser$ = of(mockUser);
      companyServiceSpy.getCompanyById = (id: string) => of(mockCompany as any);

      const route = { paramMap: { get: () => 'ENT-003' } } as any;

      const result = await TestBed.runInInjectionContext(() => {
        return firstValueFrom(tenantGuard(route, {} as RouterStateSnapshot) as any);
      });

      expect(result).toBe(true);
    });
  });

  describe('Role Restrictions (roleGuard)', () => {
    it('should allow access if user has required role', async () => {
      const mockUser: User = { id: 'u1', name: 'User 1', role: 'COMPTABLE', tenantId: 'tenant-1' };
      authServiceSpy.currentUser$ = of(mockUser);

      const route = { data: { roles: ['ADMIN', 'COMPTABLE'] } } as any;

      const result = await TestBed.runInInjectionContext(() => {
        return firstValueFrom(roleGuard(route, { url: '/test' } as RouterStateSnapshot) as any);
      });

      expect(result).toBe(true);
    });

    it('should DENY access if user does NOT have required role', async () => {
      const mockUser: User = { id: 'u1', name: 'User 1', role: 'CLIENT', tenantId: 'tenant-1' };
      authServiceSpy.currentUser$ = of(mockUser);

      const route = { data: { roles: ['ADMIN', 'COMPTABLE'] } } as any;

      const result = await TestBed.runInInjectionContext(() => {
        return firstValueFrom(roleGuard(route, { url: '/test' } as RouterStateSnapshot) as any);
      });

      expect(result).not.toBe(true);
      expect(routerSpy.lastUrlTree).toEqual(['/tenant/ENT-001/dashboard']);
    });

    it('should allow CLIENT to access reports', async () => {
      const mockUser: User = { id: 'u1', name: 'User 1', role: 'CLIENT', tenantId: 'tenant-1' };
      authServiceSpy.currentUser$ = of(mockUser);

      const route = { data: { roles: ['ADMIN', 'COMPTABLE', 'CLIENT'] } } as any;

      const result = await TestBed.runInInjectionContext(() => {
        return firstValueFrom(roleGuard(route, { url: '/bilan' } as RouterStateSnapshot) as any);
      });

      expect(result).toBe(true);
    });
  });
});
