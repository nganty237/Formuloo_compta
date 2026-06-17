import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent, IconComponent } from '@shared';
import { AuthService } from '@core';
import { CompanyService } from '../../../../core/services/company.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  loginError: string | null = null;
  isLoading = false;

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (email && password) {
        this.isLoading = true;
        this.loginError = null;
        
        this.authService.login(email, password).subscribe({
          next: (user) => {
            // Cas spécifique du client : s'il est déjà lié, on l'envoie sur son dashboard
            if (user.role === 'CLIENT' && user.companyId) {
                this.router.navigate(['/tenant', user.companyId, 'dashboard']);
                this.isLoading = false;
                return;
            }

            this.companyService.getCompanies(user.tenantId).subscribe(userCompanies => {
                if (userCompanies.length > 0) {
                    this.router.navigate(['/tenant', userCompanies[0].id, 'dashboard']);
                } else {
                    // Si pas d'entreprise, on redirige vers la sélection/création
                    this.router.navigate(['/select-dossier']);
                }
                this.isLoading = false;
            });
          },
          error: (err) => {
            this.loginError = err.message || 'Identifiants incorrects';
            this.isLoading = false;
          }
        });
      }
    }
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
