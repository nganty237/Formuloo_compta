import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { LedgerService } from '../../services/ledger.service';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { MOCK_ACCOUNTS } from '../../../../core/mocks/mock-accounts';
import { LigneEcriture } from '../../../../core/models/ligne-ecriture.model';
import { distinctUntilChanged, filter, finalize } from 'rxjs';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ButtonComponent],
  template: `
    <div class="p-8">
      <div class="bg-gradient-to-r from-blue-700 to-slate-800 rounded-xl p-8 text-white shadow-md mb-8">
        <h1 class="text-3xl font-bold mb-2">Grand Livre</h1>
        <p class="text-blue-100 text-lg">Consultez le détail des mouvements par compte comptable OHADA.</p>
      </div>

      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div>
            <p class="block text-sm font-semibold text-slate-600 mb-2">Dossier actif</p>
            <p class="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 font-semibold bg-slate-50 truncate">
              {{ (companyName$ | async) ?? 'Aucun dossier sélectionné' }}
            </p>
          </div>
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
            <app-button (clicked)="loadLedger()" [fullWidth]="true" [disabled]="isLoading || !selectedCompanyId || !selectedCompteId">
              Afficher les mouvements
            </app-button>
          </div>
        </div>
      </div>

      <app-table [data]="displayData" [columns]="columns" [isLoading]="isLoading"></app-table>
    </div>
  `
})
// Display ledger movements for a specific account
export class LedgerComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private tenantContext = inject(TenantContextService);
  private ledgerService = inject(LedgerService);

  companyName$ = this.tenantContext.companyName$;
  selectedCompanyId = '';
  accounts = MOCK_ACCOUNTS.filter(account => account.entrepriseId === 'tenant-1');
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
    this.tenantContext.companyId$.pipe(
      filter((companyId): companyId is string => !!companyId),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(companyId => {
      this.selectedCompanyId = companyId;
      this.accounts = MOCK_ACCOUNTS.filter(account => account.entrepriseId === companyId);
      this.selectedCompteId = this.accounts[0]?.id ?? '';
      this.loadLedger();
    });
  }

  loadLedger() {
    if (!this.selectedCompanyId || !this.selectedCompteId) {
      this.displayData = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.ledgerService.getGrandLivre(this.selectedCompanyId, this.selectedCompteId, this.dateDebut, this.dateFin).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      this.displayData = data;
    });
  }
}
