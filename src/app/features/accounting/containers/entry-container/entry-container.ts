import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { EntryFormComponent } from '../../pages/entry-from/entry-from';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { addEntry, resetSavedState } from '../../store/accounting.actions';
import { selectLoading, selectSaved } from '../../store/accounting.selectors';
import { Ecriture } from '../../../../core/models/ecriture.model';

@Component({
  selector: 'app-entry-container',
  standalone: true,
  imports: [CommonModule, EntryFormComponent, ModalComponent, SpinnerComponent, ButtonComponent, IconComponent],
  template: `
    <div class="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      
      <!-- En-tête -->
      <div class="max-w-4xl mx-auto mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <app-icon name="file-text" size="lg" className="text-white"></app-icon>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Saisie d'Écriture</h1>
            <p class="text-sm text-slate-500 mt-1 font-medium">Comptabilisez vos opérations en partie double avec rigueur</p>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="max-w-4xl mx-auto relative">
        
        <!-- Spinner de chargement -->
        @if (loading$ | async) {
          <div class="absolute inset-0 bg-white/60 z-50 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <app-spinner message="Comptabilisation en cours..."></app-spinner>
          </div>
        }

        <!-- Formulaire -->
        <app-entry-form (save)="onSaveEntry($event)"></app-entry-form>
      </div>

      <!-- Modale de succès -->
      <app-modal
        [isOpen]="(saved$ | async) ?? false"
        title="Succès ✓"
        (closed)="closeModal()">

        <div class="text-center py-6 flex flex-col items-center">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-md">
            <app-icon name="circle-check" size="xl"></app-icon>
          </div>
          
          <div class="space-y-2 mb-6">
            <p class="text-xl font-bold text-slate-900">Écriture comptabilisée !</p>
            <p class="text-sm text-slate-600">Votre opération a été enregistrée avec succès en partie double.</p>
            <div class="pt-2 border-t border-slate-200">
              <p class="text-xs text-slate-500">ID de transaction : <span class="font-mono font-semibold text-slate-700">{{ lastEntryId }}</span></p>
            </div>
          </div>
          
          <div class="flex gap-3 w-full">
            <app-button (clicked)="addNewEntry()" customClass="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-all shadow-sm active:scale-95">
              Nouvelle écriture
            </app-button>
            <app-button (clicked)="closeModal()" customClass="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-all active:scale-95">
              Consulter le journal
            </app-button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class EntryContainerComponent {
  private store = inject(Store);

  loading$ = this.store.select(selectLoading);
  saved$ = this.store.select(selectSaved);
  lastEntryId: string = '';

  onSaveEntry(ecriture: Ecriture) {
    this.lastEntryId = ecriture.id;
    this.store.dispatch(addEntry({ entry: ecriture }));
  }

  addNewEntry() {
    this.closeModal();
    // Scroll vers le formulaire pour une meilleure UX
    setTimeout(() => {
      document.querySelector('app-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  closeModal() {
    this.store.dispatch(resetSavedState());
  }
}
