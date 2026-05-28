import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileDropdownComponent } from '../../../shared/profile-dropdown/profile-dropdown';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ProfileDropdownComponent, ButtonComponent],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tenantContext = inject(TenantContextService);

  companyName$ = this.tenantContext.companyName$;
  isProfileMenuOpen = signal<boolean>(false);

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

    this.tenantContext.selectCompany(this.selectedCompanyId, this.companies[0].name, this.selectedTenantId);
  }

  onCompanyChange(newCompanyId: string) {
    this.selectedCompanyId = newCompanyId;
    const company = this.companies.find(c => c.id === newCompanyId);
    if (company) {
      this.tenantContext.selectCompany(company.id, company.name, this.selectedTenantId);
    }
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation(); 
    this.isProfileMenuOpen.update(prev => !prev);
  }

  handleLogout(): void {
    this.isProfileMenuOpen.set(false);
    // this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
