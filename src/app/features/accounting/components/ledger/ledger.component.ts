import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { LedgerService } from '../../services/ledger.service';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table';
import { MOCK_ACCOUNTS } from '../../../../core/mocks/mock-accounts';
import { LigneEcriture } from '../../../../core/models/ligne-ecriture.model';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  template: `
    <div class="p-8">
      <div class="bg-gradient-to-r from-blue-700 to-slate-800 rounded-xl p-8 text-white shadow-md mb-8">
        <h1 class="text-3xl font-bold mb-2">Grand Livre</h1>
        <p class="text-blue-100 text-lg">Consultez le détail des mouvements par compte comptable OHADA.</p>
      </div>

      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-2">Compte OHADA</label>
            <select [(ngModel)]="selectedCompteId" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-700 font-medium bg-white cursor-pointer">
              @for (compte of accounts; track compte.id) {
                <option [value]="compte.id">{{ compte.numero }} - {{ compte.intitule }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-2">Date de début</label>
            <input type="date" [(ngModel)]="dateDebut" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-700 font-medium">
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-2">Date de fin</label>
            <input type="date" [(ngModel)]="dateFin" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-700 font-medium">
          </div>
          <div>
            <button (click)="loadLedger()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-sm">
              Afficher les mouvements
            </button>
          </div>
        </div>
      </div>

      <app-table [data]="displayData" [columns]="columns" [isLoading]="isLoading"></app-table>
    </div>
  `
})
//  ce composant permet d'afficher les ecritures du grand livre
export class LedgerComponent implements OnInit {
  private tenantContext = inject(TenantContextService);
  private ledgerService = inject(LedgerService);

  accounts = MOCK_ACCOUNTS; 
  selectedCompteId = 'cpt-401';
  dateDebut = '2024-01-01';
  dateFin = new Date().toISOString().split('T')[0];
  
  isLoading = false;
  displayData: LigneEcriture[] = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID Ligne', type: 'text' },
    { key: 'ecritureId', label: 'ID Écriture', type: 'text' },
    { key: 'debit', label: 'Débit', type: 'currency' },
    { key: 'credit', label: 'Crédit', type: 'currency' }
  ];

  ngOnInit() {
    this.loadLedger();
  }

  loadLedger() {
    this.isLoading = true;
    this.tenantContext.companyId$.pipe(
      switchMap(companyId => {
        if (!companyId) return of([]);
        return this.ledgerService.getGrandLivre(companyId, this.selectedCompteId, this.dateDebut, this.dateFin);
      })
    ).subscribe(data => {
      this.displayData = data;
      this.isLoading = false;
    });
  }
}
