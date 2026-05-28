import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Connexion :', this.loginForm.value);
      this.router.navigate(['/tenant/tenant-123/dashboard']);
    }
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
