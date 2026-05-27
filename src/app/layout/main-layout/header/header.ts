import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TenantContextService } from '../../../core/services/tenant-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tenantContext = inject(TenantContextService);

  companyName$ = this.tenantContext.companyName$;

  companies = [
    { id: 'tenant-1', name: 'Tech Solutions SAS' },
    { id: 'c-002', name: 'Boulangerie Le Pain Doré' }
  ];

  selectedTenantId = '123';
  selectedCompanyId = 'tenant-1';

  ngOnInit() {
    const urlTenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (urlTenantId) {
      this.selectedTenantId = urlTenantId;
    }

    // Initialisation du contexte avec la première entreprise mockée
    this.tenantContext.selectCompany(this.selectedCompanyId, this.companies[0].name, this.selectedTenantId);
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