import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';

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
export class SignupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Formulaire réactif avec les champs nécessaires pour créer un Tenant (Cabinet)
  signupForm = this.fb.group({
    cabinetName: ['', [Validators.required, Validators.minLength(3)]],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    acceptTerms: [false, Validators.requiredTrue] // Doit obligatoirement accepter les CGU
  }, { validators: passwordMatchValidator }); // On attache le validateur croisé au groupe

  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Création du cabinet en cours...', this.signupForm.value);
      
      // Simulation d'une création réussie et redirection directe vers le dashboard
      // On utilise le même ID de tenant fictif que pour le login pour l'instant
      this.router.navigate(['/tenant/ENT-001/dashboard']);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
