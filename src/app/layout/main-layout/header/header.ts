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

  selectedTenantId = '';
  selectedCompanyId = '';

  ngOnInit() {
    // Récupérer l'ID de l'entreprise depuis l'URL
    const urlId = this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id');
    
    if (urlId) {
      this.selectedCompanyId = urlId;
      // On cherche l'entreprise pour initialiser le contexte
      const companies = this.companyService.companies();
      const company = companies.find(c => c.id === urlId);
      if (company) {
        this.tenantContext.selectCompany(company.id, company.nom, company.tenantId);
        this.planService.initializeForCompany(company.id).subscribe();
      } else {
        // Si les entreprises ne sont pas encore chargées (cas du refresh)
        // Le tenantGuard s'en occupe déjà, mais on peut renforcer ici
        this.companyService.getCompanyById(urlId).subscribe(comp => {
          if (comp) {
            this.tenantContext.selectCompany(comp.id, comp.nom, comp.tenantId);
            this.planService.initializeForCompany(comp.id).subscribe();
          }
        });
      }
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
