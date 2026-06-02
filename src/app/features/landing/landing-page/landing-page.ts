import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent, ButtonComponent } from '@shared';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, ButtonComponent],
  template: `
    <!-- Hero Section -->
    <section class="relative pt-20 pb-32 overflow-hidden bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            La gestion comptable <span class="text-blue-600">OHADA</span> enfin simplifiée.
          </h1>
          <p class="text-xl text-slate-600 mb-12 leading-relaxed">
            Formuloo Compta automatise vos écritures, simplifie votre facturation et connecte les cabinets à leurs clients en temps réel.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <app-button routerLink="/auth/register/type"
              customClass="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-lg px-10 py-5 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              Démarrer gratuitement
            </app-button>
            <app-button customClass="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-lg px-10 py-5 transition-all duration-300 hover:border-slate-300">
              Voir la démo
            </app-button>
          </div>
        </div>
      </div>
      <!-- Decorative element -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </section>
    <!-- Roles Section -->
    <section id="roles" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Une solution adaptée à chaque profil</h2>
          <p class="text-slate-500 max-w-2xl mx-auto font-medium">Parce que chaque acteur a des besoins spécifiques, nous avons conçu des outils sur-mesure.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Cabinet Card -->
          <div class="p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
            <div class="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <app-icon name="building" size="lg"></app-icon>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Cabinets Comptables</h3>
            <p class="text-slate-600 mb-8 leading-relaxed font-medium">
              Gérez des centaines de dossiers clients sur une interface unique. Automatisez la saisie et collaborez sans effort.
            </p>
            <ul class="space-y-3 mb-8 text-sm font-semibold text-slate-500">
              <li class="flex items-center gap-2"><app-icon name="check" size="xs" className="text-green-500"></app-icon> Multi-tenancy illimité</li>
              <li class="flex items-center gap-2"><app-icon name="check" size="xs" className="text-green-500"></app-icon> Dashboard de pilotage</li>
            </ul>
            <a routerLink="/auth/register/type" [queryParams]="{role: 'cabinet'}" class="text-blue-600 font-bold hover:underline">Découvrir l'offre Cabinet &rarr;</a>
          </div>
          <!-- Enterprise Card -->
          <div class="p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
            <div class="bg-green-100 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <app-icon name="users" size="lg"></app-icon>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Entreprises (PME/TPE)</h3>
            <p class="text-slate-600 mb-8 leading-relaxed font-medium">
              Facturation certifiée, suivi de trésorerie et transmission automatique des pièces à votre comptable.
            </p>
            <ul class="space-y-3 mb-8 text-sm font-semibold text-slate-500">
              <li class="flex items-center gap-2"><app-icon name="check" size="xs" className="text-green-500"></app-icon> Facturation pro</li>
              <li class="flex items-center gap-2"><app-icon name="check" size="xs" className="text-green-500"></app-icon> Pilotage de cash-flow</li>
            </ul>
            <a routerLink="/auth/register/type" [queryParams]="{role: 'client'}" class="text-blue-600 font-bold hover:underline">Découvrir l'offre PME &rarr;</a>
          </div>
          <!-- Freelance Card -->
          <div class="p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
            <div class="bg-amber-100 text-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <app-icon name="briefcase" size="lg"></app-icon>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Indépendants</h3>
            <p class="text-slate-600 mb-8 leading-relaxed font-medium">
              Une comptabilité simplifiée au maximum pour vous concentrer sur votre métier, en toute conformité.
            </p>
            <ul class="space-y-3 mb-8 text-sm font-semibold text-slate-500">
              <li class="flex items-center gap-2"><app-icon name="check" size="xs" className="text-green-500"></app-icon> Saisie intuitive</li>
              <li class="flex items-center gap-2"><app-icon name="check" size="xs" className="text-green-500"></app-icon> État financier instantané</li>
            </ul>
            <a routerLink="/auth/register/type" [queryParams]="{role: 'comptable'}" class="text-blue-600 font-bold hover:underline">Découvrir l'offre Solo &rarr;</a>
          </div>
        </div>
      </div>
    </section>
  `
})
export class LandingPageComponent {}
