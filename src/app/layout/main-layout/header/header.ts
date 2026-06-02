import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileDropdownComponent, ButtonComponent, IconComponent, HasRoleDirective } from '@shared';
import { TenantContextService, CompanyService, AuthService } from '@core';
import { PlanComptableService } from '@features/accounting';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, of, startWith } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ProfileDropdownComponent, ButtonComponent, IconComponent, RouterModule, HasRoleDirective],
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

  // Entreprises filtrées par tenant de l'utilisateur courant
  filteredCompanies = toSignal(
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }
        // Retourner les entreprises filtrées du tenant de l'utilisateur
        return this.companyService.getCompanies().pipe(
          map(companies => companies.filter(c => c.tenantId === user.tenantId))
        );
      }),
      startWith([])
    )
  );

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

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen.update(prev => !prev);
  }

  handleLogout(): void {
    this.isProfileMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
