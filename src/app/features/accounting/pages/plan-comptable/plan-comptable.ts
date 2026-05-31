import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../../../../core/services/account.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { CompteOHADA } from '../../../../core/models/compte-ohada.model';

@Component({
  selector: 'app-plan-comptable',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- En-tête -->
      <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Plan Comptable OHADA</h1>
          <p class="text-slate-500 text-sm mt-1">Configurez et personnalisez les comptes comptables pour {{ companyName() }}</p>
        </div>
        
        <button 
          (click)="showAddForm.set(!showAddForm())"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
          <app-icon [name]="showAddForm() ? 'x' : 'plus'" size="sm"></app-icon>
          <span>{{ showAddForm() ? 'Fermer' : 'Créer un sous-compte' }}</span>
        </button>
      </div>

      <!-- Formulaire d'ajout de sous-compte -->
      @if (showAddForm()) {
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <app-icon name="plus-circle" className="text-blue-600"></app-icon>
            Nouveau sous-compte
          </h2>

          <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Numéro de compte *</label>
              <input 
                type="text" 
                formControlName="numero" 
                placeholder="Ex: 706100" 
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm font-mono">
              @if (hasError('numero')) {
                <p class="text-xs text-red-600 mt-1 font-medium">Le numéro est obligatoire.</p>
              }
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Intitulé du compte *</label>
              <input 
                type="text" 
                formControlName="intitule" 
                placeholder="Ex: Prestations de conseil informatique" 
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm">
              @if (hasError('intitule')) {
                <p class="text-xs text-red-600 mt-1 font-medium">L'intitulé est obligatoire.</p>
              }
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Type de compte *</label>
              <select 
                formControlName="type"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer">
                <option value="ACTIF">ACTIF (Emplois / Débiteur)</option>
                <option value="PASSIF">PASSIF (Ressources / Créditeur)</option>
                <option value="CHARGE">CHARGE (Classe 6 / Débiteur)</option>
                <option value="PRODUIT">PRODUIT (Classe 7 / Créditeur)</option>
              </select>
            </div>

            <div class="col-span-4 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                (click)="showAddForm.set(false)"
                class="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors text-sm cursor-pointer">
                Annuler
              </button>
              <button 
                type="submit" 
                [disabled]="accountForm.invalid"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm shadow-sm cursor-pointer">
                Créer le compte
              </button>
            </div>
          </form>
          @if (errorMessage()) {
            <p class="text-sm text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border-l-4 border-red-500 mt-2">{{ errorMessage() }}</p>
          }
        </div>
      @}

      <!-- Barre de recherche et de filtres par classe -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-80">
          <input 
            type="text" 
            [formControl]="searchControl"
            placeholder="Rechercher par numéro ou intitulé..." 
            class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm">
          <app-icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size="sm"></app-icon>
        </div>

        <!-- Boutons de filtres de classe -->
        <div class="flex flex-wrap gap-2">
          <button 
            (click)="selectedClass.set(null)"
            [class]="!selectedClass() ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer">
            Tous
          </button>
          @for (c of classes; track c) {
            <button 
              (click)="selectedClass.set(c)"
              [class]="selectedClass() === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer">
              Classe {{ c }}
            </button>
          }
        </div>
      </div>

      <!-- Liste des comptes sous forme de tableau -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <th class="p-4 w-32">Numéro</th>
              <th class="p-4">Intitulé</th>
              <th class="p-4 w-32">Classe</th>
              <th class="p-4 w-36">Type</th>
              <th class="p-4 w-28 text-center">Statut</th>
              <th class="p-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (acc of filteredAccounts(); track acc.id) {
              <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors" [class.opacity-60]="!acc.actif">
                <td class="p-4 font-mono font-bold text-slate-800 text-sm">{{ acc.numero }}</td>
                <td class="p-4 font-semibold text-slate-700">{{ acc.intitule }}</td>
                <td class="p-4">
                  <span class="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-xs font-bold">
                    Classe {{ acc.classe }}
                  </span>
                </td>
                <td class="p-4">
                  <span [class]="getTypeBadgeClass(acc.type)" class="px-2 py-0.5 rounded text-xs font-bold tracking-wide border">
                    {{ acc.type }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <span 
                    [class]="acc.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'"
                    class="px-2.5 py-1 rounded-full text-xs font-bold border inline-block">
                    {{ acc.actif ? 'Actif' : 'Désactivé' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button 
                    (click)="toggleStatus(acc)"
                    [class]="acc.actif ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'"
                    class="p-1 rounded transition-colors text-xs font-bold cursor-pointer">
                    {{ acc.actif ? 'Désactiver' : 'Activer' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-8 text-center text-slate-400">Aucun compte ne correspond à votre recherche.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class PlanComptableComponent {
  private accountService = inject(AccountService);
  private tenantContext = inject(TenantContextService);
  private fb = inject(FormBuilder);

  companyId = toSignal(this.tenantContext.companyId$);
  companyName = toSignal(this.tenantContext.companyName$);

  showAddForm = signal<boolean>(false);
  errorMessage = signal<string>('');
  selectedClass = signal<number | null>(null);

  classes = [1, 2, 3, 4, 5, 6, 7, 8];

  // Champ de recherche lié à un FormControl standard
  searchControl = this.fb.control('');

  // Signal pour la recherche textuelle
  searchQuery = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  // Liste filtrée des comptes réagissant aux filtres et à la recherche
  filteredAccounts = computed(() => {
    const activeCompanyId = this.companyId() || 'tenant-1';
    const query = (this.searchQuery() || '').toLowerCase().trim();
    const currentClass = this.selectedClass();
    
    // Obtenir les comptes pour l'entreprise
    let list = this.accountService.accounts().filter(acc => acc.entrepriseId === activeCompanyId);

    // Filtre par classe
    if (currentClass) {
      list = list.filter(acc => acc.classe === currentClass);
    }

    // Filtre de recherche textuelle
    if (query) {
      list = list.filter(acc => 
        acc.numero.includes(query) || 
        acc.intitule.toLowerCase().includes(query)
      );
    }

    // Trier les comptes par numéro comptable
    return list.sort((a, b) => a.numero.localeCompare(b.numero));
  });

  accountForm = this.fb.group({
    numero: ['', [Validators.required, Validators.pattern(/^[1-8]\d+/)]], // Doit commencer par 1-8
    intitule: ['', Validators.required],
    type: ['CHARGE', Validators.required]
  });

  hasError(controlName: string): boolean {
    const control = this.accountForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.accountForm.invalid) return;
    this.errorMessage.set('');

    const formValue = this.accountForm.value;
    const activeCompanyId = this.companyId() || 'tenant-1';

    // Déterminer la classe automatiquement à partir du premier chiffre du numéro
    const firstDigit = parseInt(formValue.numero!.substring(0, 1), 10);

    this.accountService.addCustomAccount(activeCompanyId, {
      numero: formValue.numero!,
      intitule: formValue.intitule!,
      classe: firstDigit,
      type: formValue.type as any
    }).subscribe({
      next: () => {
        this.accountForm.reset({
          numero: '',
          intitule: '',
          type: 'CHARGE'
        });
        this.showAddForm.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur : Impossible d\'ajouter le compte. Il existe peut-être déjà.');
      }
    });
  }

  toggleStatus(account: CompteOHADA): void {
    this.accountService.toggleAccountStatus(account.id, !account.actif);
  }

  getTypeBadgeClass(type: CompteOHADA['type']): string {
    switch (type) {
      case 'CHARGE': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'PRODUIT': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ACTIF': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PASSIF': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
  }
}
