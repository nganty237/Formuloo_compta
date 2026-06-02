import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent, ButtonComponent } from '@shared';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-white">
      <header class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
              <div class="bg-blue-600 p-2 rounded-lg shadow-sm">
                <app-icon name="scale" size="sm" className="text-white"></app-icon>
              </div>
              <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                Formuloo Compta
              </span>
            </div>

            <nav class="hidden md:flex items-center gap-8">
              <a href="#features" class="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Fonctionnalités</a>
              <a href="#roles" class="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Solutions</a>
              <a href="#about" class="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">À propos</a>
            </nav>

            <div class="flex items-center gap-4">
              <a routerLink="/auth/login" class="text-sm font-semibold text-slate-600 hover:text-blue-600 px-4 py-2 transition-colors">
                Connexion
              </a>
              <app-button routerLink="/auth/register/type" 
                customClass="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transition-all duration-300 transform hover:-translate-y-0.5 px-6">
                Essai gratuit
              </app-button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-slate-50 border-t border-slate-200 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-8">
            <div class="flex flex-col items-center md:items-start gap-3">
              <div class="flex items-center gap-2">
                <div class="bg-blue-600 p-1.5 rounded-md">
                  <app-icon name="scale" size="xs" className="text-white"></app-icon>
                </div>
                <span class="text-lg font-bold text-slate-900">Formuloo Compta</span>
              </div>
              <p class="text-sm text-slate-500 font-medium">L'excellence comptable aux normes SYSCOHADA.</p>
            </div>
            
            <nav class="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-600">
              <a class="hover:text-blue-600 transition-colors">Produit</a>
              <a class="hover:text-blue-600 transition-colors">Tarifs</a>
              <a class="hover:text-blue-600 transition-colors">À propos</a>
              <a class="hover:text-blue-600 transition-colors">Contact</a>
              <a class="hover:text-blue-600 transition-colors">Légal</a>
            </nav>

            <div class="text-xs text-slate-400 font-medium">
              &copy; 2026 Formuloo Compta.
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingLayoutComponent {}
