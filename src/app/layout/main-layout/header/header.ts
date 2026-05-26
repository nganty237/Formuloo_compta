import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TenantContextService } from '../../../core/services/tenant-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tenantContext = inject(TenantContextService);

  // Observable pour le nom de l'entreprise active (utilisé avec le pipe async dans le template)
  companyName$ = this.tenantContext.companyName$;

  tenants = [
    { id: '123', name: 'Cabinet Expert & Co' },
    { id: '456', name: 'Cabinet Alpha Conseil' },
    { id: '789', name: 'Cabinet Horizon Compta' }
  ];

  // Données mockées pour les entreprises du cabinet (sélecteur statique)
  companies = [
    { id: 'c-001', name: 'Tech Solutions SAS' },
    { id: 'c-002', name: 'Boulangerie Le Pain Doré' }
  ];

  selectedTenantId = '123';
  selectedCompanyId = 'c-001';

  ngOnInit() {
    const urlTenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (urlTenantId) {
      this.selectedTenantId = urlTenantId;
    }

    // Initialisation du contexte avec la première entreprise mockée
    this.tenantContext.selectCompany(this.selectedCompanyId, this.companies[0].name, this.selectedTenantId);
  }

  onTenantChange(newTenantId: string) {
    this.selectedTenantId = newTenantId;
    this.router.navigate(['/tenant', newTenantId, 'dashboard']);
  }

  // Appelé quand l'utilisateur change d'entreprise dans le sélecteur statique
  onCompanyChange(newCompanyId: string) {
    this.selectedCompanyId = newCompanyId;
    const company = this.companies.find(c => c.id === newCompanyId);
    if (company) {
      // Mise à jour de l'état global via le service RxJS
      this.tenantContext.selectCompany(company.id, company.name, this.selectedTenantId);
    }
  }
}