import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { OnboardingService, OnboardingRole } from '../../services/onboarding.service';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './role-selection.html'
})
export class RoleSelectionComponent {
  private router = inject(Router);
  private onboardingService = inject(OnboardingService);

  // Utilisation des rôles dynamiques du service
  roles = this.onboardingService.availableRoles;

  selectRole(roleId: OnboardingRole) {
    this.onboardingService.setRole(roleId);
    this.router.navigate(['/auth/register/form']);
  }
}
