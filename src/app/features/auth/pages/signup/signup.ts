import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { OnboardingService, OnboardingRole } from '../../services/onboarding.service';
import { AuthService } from '../../../../core/services/auth.service';

// Custom Validator : Vérifie que le mot de passe et sa confirmation sont identiques
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    // Force l'erreur sur le champ confirmPassword pour faciliter l'affichage côté HTML
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  templateUrl: './signup.html'
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private onboardingService = inject(OnboardingService);
  private authService = inject(AuthService);

  // Exposer le signal du service pour le template
  selectedRole = this.onboardingService.selectedRole;

  // Formulaire réactif avec champs conditionnels
  signupForm = this.fb.group({
    organizationName: ['', [Validators.required, Validators.minLength(3)]],
    // Champs spécifiques
    siret: [''], // Requis pour cabinet
    sector: [''], // Requis pour client
    
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    acceptTerms: [false, Validators.requiredTrue]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    // Le rôle est déjà dans le service via role-selection
    const roleParam = this.route.snapshot.queryParamMap.get('role') as OnboardingRole;
    if (roleParam && ['cabinet', 'client', 'comptable'].includes(roleParam)) {
      this.onboardingService.setRole(roleParam);
    }

    if (!this.selectedRole()) {
      this.router.navigate(['/auth/register/type']);
      return;
    }

    this.applyRoleValidation();
  }

  private applyRoleValidation() {
    const role = this.selectedRole();
    const siretControl = this.signupForm.get('siret');
    const sectorControl = this.signupForm.get('sector');

    if (role === 'cabinet') {
      siretControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{14}$/)]);
    } else if (role === 'client') {
      sectorControl?.setValidators([Validators.required]);
    }

    siretControl?.updateValueAndValidity();
    sectorControl?.updateValueAndValidity();
  }

  get roleLabel(): string {
    switch (this.selectedRole()) {
      case 'cabinet': return 'Nom du cabinet';
      case 'client': return "Nom de l'entreprise";
      case 'comptable': return 'Nom de votre structure (ou Prénom Nom)';
      default: return 'Organisation';
    }
  }

  get pageTitle(): string {
    switch (this.selectedRole()) {
      case 'cabinet': return 'Créer un cabinet';
      case 'client': return 'Inscrire mon entreprise';
      case 'comptable': return 'Inscription Comptable';
      default: return 'Inscription';
    }
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const role = this.selectedRole();
      if (!role) return;

      this.authService.register(this.signupForm.value, role);
      this.router.navigate(['/tenant/ENT-001/dashboard']);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
