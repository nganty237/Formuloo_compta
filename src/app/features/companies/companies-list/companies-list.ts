import { CompanyService, CompanyWithTaxInfo, AuthService } from '@core';
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {  IconComponent  } from '@shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- En-tête -->
      <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <app-icon name="layout-dashboard" size="lg"></app-icon>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-800">
                {{ currentUser()?.role === 'CLIENT' ? 'Mon Dossier' : (currentUser()?.role === 'ADMIN' ? 'Espace Cabinet' : 'Espace Comptable') }}
              </h1>
              <p class="text-slate-500 text-sm mt-1">
                {{ currentUser()?.role === 'CLIENT' ? 'Accédez à votre comptabilité en ligne' : 'Sélectionnez un dossier client pour commencer à travailler' }}
              </p>
            </div>
        </div>
        
        <div class="flex items-center gap-3">
            <div class="text-right mr-2 hidden md:block">
                <p class="text-sm font-bold text-slate-800">{{ currentUser()?.name }}</p>
                <p class="text-xs text-slate-500">{{ currentUser()?.email }}</p>
            </div>
            <button 
              (click)="onLogout()"
              class="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-slate-200"
              title="Déconnexion">
              <app-icon name="log-out" size="sm"></app-icon>
            </button>
            @if (currentUser()?.role !== 'CLIENT') {
                <div class="w-px h-8 bg-slate-200 mx-2"></div>
                <button 
                  (click)="showCreateForm.set(!showCreateForm())"
                  class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
                  <app-icon [name]="showCreateForm() ? 'x' : 'plus'" size="sm"></app-icon>
                  <span>{{ showCreateForm() ? 'Masquer' : 'Nouveau dossier' }}</span>
                </button>
            }
        </div>
      </div>

      <!-- Formulaire d'ajout d'entreprise -->
      @if (showCreateForm()) {
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <app-icon name="building" className="text-blue-600"></app-icon>
            Nouvelle Entreprise Cliente
          </h2>
          <form [formGroup]="companyForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- ... (form content remains same) ... -->
            <div class="form-group col-span-2 md:col-span-1">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nom de l'entreprise *</label>
              <input 
                type="text" 
                formControlName="nom" 
                placeholder="Ex: Tech Solutions SAS" 
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm">
              @if (hasError('nom')) {
                <p class="text-xs text-red-600 mt-1 font-medium">Le nom est obligatoire.</p>
              }
            </div>
            <div class="form-group col-span-2 md:col-span-1">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Email du Client / Gérant *</label>
              <input 
                type="email" 
                formControlName="emailContact" 
                placeholder="Ex: client@exemple.com" 
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm">
              @if (hasError('emailContact')) {
                <p class="text-xs text-red-600 mt-1 font-medium">L'email de contact est obligatoire et doit être valide.</p>
              }
            </div>
            <div class="form-group">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Numéro d'Identification Fiscale (NIF / NINEA) *</label>
              <input 
                type="text" 
                formControlName="ninea" 
                placeholder="Ex: 1234567-SN" 
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm">
              @if (hasError('ninea')) {
                <p class="text-xs text-red-600 mt-1 font-medium">L'identifiant fiscal (NINEA/NIF) est obligatoire.</p>
              }
            </div>
            <div class="form-group">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Régistre du Commerce (RCCM)</label>
              <input 
                type="text" 
                formControlName="rccm" 
                placeholder="Ex: SN-DKR-2023-B-12" 
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm">
            </div>
            <div class="form-group">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Pays *</label>
              <select 
                formControlName="pays"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer">
                <option value="Cameroun">Cameroun</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Gabon">Gabon</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Togo">Togo</option>
              </select>
            </div>
            <div class="form-group">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Devise *</label>
              <select 
                formControlName="devise"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer">
                <option value="XOF">Franc CFA (XOF)</option>
                <option value="XAF">Franc CFA (XAF)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar US (USD)</option>
              </select>
            </div>
            <div class="form-group col-span-2">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Adresse *</label>
              <input 
                type="text" 
                formControlName="adresse" 
                placeholder="Ex: Rue 12, Douala, Cameroun" 
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm">
              @if (hasError('adresse')) {
                <p class="text-xs text-red-600 mt-1 font-medium">L'adresse est obligatoire.</p>
              }
            </div>
            <div class="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                (click)="showCreateForm.set(false)"
                class="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors text-sm cursor-pointer">
                Annuler
              </button>
              <button 
                type="submit" 
                [disabled]="companyForm.invalid"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm shadow-sm cursor-pointer">
                Enregistrer le dossier
              </button>
            </div>
          </form>
        </div>
      @}

      <!-- Liste des entreprises (Cartes) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (company of filteredCompanies(); track company.id) {
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex justify-between items-start">
                <div class="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
                  {{ company.nom.substring(0, 1).toUpperCase() }}
                </div>
                <span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-bold font-mono">
                  {{ company.devise }}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-800 line-clamp-1">{{ company.nom }}</h3>
                <p class="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <app-icon name="map-pin" size="xs"></app-icon>
                  {{ company.pays }}
                </p>
              </div>
              <div class="pt-2 space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400 font-medium">NIF</span>
                  <span class="text-slate-700 font-mono">{{ company.ninea }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400 font-medium">RCCM</span>
                  <span class="text-slate-700 font-mono">{{ company.rccm || 'N/A' }}</span>
                </div>
              </div>
            </div>
            
            <button 
              (click)="onSelectCompany(company)"
              class="w-full mt-6 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 hover:border-blue-600 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 group cursor-pointer">
              Ouvrir le dossier
              <app-icon name="chevron-right" size="sm" class="group-hover:translate-x-0.5 transition-transform"></app-icon>
            </button>
          </div>
        } @empty {
          <div class="col-span-full py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center px-4">
            <div class="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
              <app-icon name="building" size="xl"></app-icon>
            </div>
            
            @if (currentUser()?.role === 'CLIENT') {
                <h3 class="text-lg font-bold text-slate-800">Dossier en attente</h3>
                <p class="text-slate-500 max-w-sm mt-2 text-sm">
                  Aucune entreprise n'est encore rattachée à votre compte. 
                  Dès que votre cabinet aura configuré votre accès avec l'email <strong>{{ currentUser()?.email }}</strong>, 
                  votre dossier apparaîtra ici.
                </p>
            } @else {
                <h3 class="text-lg font-bold text-slate-800">Aucun dossier client</h3>
                <p class="text-slate-500 max-w-sm mt-2 text-sm">
                  Vous n'avez pas encore configuré d'entreprise à gérer. 
                  Commencez par ajouter votre premier dossier client.
                </p>
                <button 
                  (click)="showCreateForm.set(true)"
                  class="mt-6 text-blue-600 font-bold text-sm hover:underline cursor-pointer">
                  Ajouter une entreprise maintenant
                </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CompaniesListComponent {
  public companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentUser = toSignal(this.authService.currentUser$);

  filteredCompanies = computed(() => {
    const user = this.currentUser();
    const list = this.companyService.companies();
    if (!user) return [];
    if (user.role === 'SUPER_ADMIN') return list;
    return list.filter(c => c.tenantId === user.tenantId);
  });

  showCreateForm = signal<boolean>(false);
  companyForm = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    emailContact: ['', [Validators.required, Validators.email]],
    ninea: ['', Validators.required],
    rccm: [''],
    pays: ['Sénégal', Validators.required],
    devise: ['XOF', Validators.required],
    adresse: ['', Validators.required]
  });

  hasError(controlName: string): boolean {
    const control = this.companyForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSelectCompany(company: CompanyWithTaxInfo): void {
    this.router.navigate(['/tenant', company.id, 'dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;
    const val = this.companyForm.getRawValue();
    this.companyService.addCompany({
      nom: val.nom || '',
      emailContact: val.emailContact || '',
      ninea: val.ninea || '',
      rccm: val.rccm || '',
      pays: val.pays || 'Sénégal',
      devise: val.devise || 'XOF',
      adresse: val.adresse || ''
    });
    this.companyForm.reset({
      nom: '',
      emailContact: '',
      ninea: '',
      rccm: '',
      pays: 'Sénégal',
      devise: 'XOF',
      adresse: ''
    });
    this.showCreateForm.set(false);
  }
}
