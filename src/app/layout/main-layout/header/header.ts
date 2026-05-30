import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileDropdownComponent } from '../../../shared/components/profile-dropdown/profile-dropdown';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlanComptableService } from '../../../features/accounting/services/plan-comptable.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ProfileDropdownComponent, ButtonComponent, IconComponent, RouterModule],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tenantContext = inject(TenantContextService);
  public companyService = inject(CompanyService);
  public authService = inject(AuthService);
  private planService = inject(PlanComptableService);

  companyName$ = this.tenantContext.companyName$;
  isProfileMenuOpen = signal<boolean>(false);
  currentUser = toSignal(this.authService.currentUser$);

  selectedTenantId = '123';
  selectedCompanyId = 'tenant-1';

  ngOnInit() {
    const urlTenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (urlTenantId) {
      this.selectedTenantId = urlTenantId;
    }

    const initialCompanies = this.companyService.companies();
    if (initialCompanies.length > 0) {
      const defaultComp = initialCompanies[0];
      this.selectedCompanyId = defaultComp.id;
      this.tenantContext.selectCompany(defaultComp.id, defaultComp.nom, this.selectedTenantId);
      // S'assurer que le plan comptable est chargé pour le dossier par défaut
      this.planService.initializeForCompany(defaultComp.id).subscribe();
    }
  }

  onCompanyChange(newCompanyId: string) {
    this.selectedCompanyId = newCompanyId;
    const company = this.companyService.companies().find(c => c.id === newCompanyId);
    if (company) {
      this.tenantContext.selectCompany(company.id, company.nom, this.selectedTenantId);
      // Auto-initialisation du plan comptable si vide pour ce nouveau dossier
      this.planService.initializeForCompany(company.id).subscribe();
    }
  }

  onRoleChange(newRole: string) {
    this.authService.updateRole(newRole as any);
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation(); 
    this.isProfileMenuOpen.update(prev => !prev);
  }

  handleLogout(): void {
    this.isProfileMenuOpen.set(false);
    this.router.navigate(['/auth/login']);
  }
}
