import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import {   InvoiceFormComponent } from '../../../invoicing/pages/invoice-form/invoice-form';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner';
import { addEntry, resetSavedState } from '../../store/accounting.actions';
import { selectLoading, selectSaved } from '../../store/accounting.selectors';

@Component({
  selector: 'app-invoice-container',
  standalone: true,
  imports: [CommonModule, InvoiceFormComponent, ModalComponent, SpinnerComponent],
  template: `
    <div class="relative p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-slate-800">Nouvelle Facture</h1>

      @if (loading$ | async) {
        <div class="absolute inset-0 bg-white/60 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <app-spinner></app-spinner>
        </div>
      }

      <app-invoice-form (save)="onSaveInvoice($event)"></app-invoice-form>

      <app-modal
        [isOpen]="(saved$ | async) ?? false"
        title="Succès"
        (closed)="closeModal()">

        <div class="p-6 text-center flex flex-col items-center">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">✓</div>
          <p class="text-lg font-bold text-slate-800">Facture validée !</p>
          <p class="text-sm text-slate-500 mt-2">
            L'écriture a été générée en partie double dans le journal de vente.
          </p>
          <button (click)="closeModal()" class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
            Fermer
          </button>
        </div>
      </app-modal>
    </div>
  `
})
export class InvoiceContainerComponent {
  private store = inject(Store);

  loading$ = this.store.select(selectLoading);
  saved$ = this.store.select(selectSaved);

  onSaveInvoice(formData: any) {
    const entryId = crypto.randomUUID();
    const newEntry = {
      id: entryId,
      entrepriseId: formData.entrepriseId ?? '',
      journalId: 'VEN',
      date: new Date().toISOString(),
      libelle: `Facture client ${formData.clientId}`,
      valide: false,
      lignes: [
        {
          id: crypto.randomUUID(),
          ecritureId: entryId,
          compteId: '411000',
          debit: formData.montantTTC,
          credit: 0
        },
        {
          id: crypto.randomUUID(),
          ecritureId: entryId,
          compteId: formData.compteProduitId,
          debit: 0,
          credit: formData.montantHT
        },
        {
          id: crypto.randomUUID(),
          ecritureId: entryId,
          compteId: '443000', 
          debit: 0,
          credit: formData.montantTVA
        }
      ]
    };

    this.store.dispatch(addEntry({ entry: newEntry }));
  }

  closeModal() {
    this.store.dispatch(resetSavedState());
  }
}
