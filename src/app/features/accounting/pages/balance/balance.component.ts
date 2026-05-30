import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { BalanceService, LigneBalance } from '../../services/balance.service';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { distinctUntilChanged, filter, finalize } from 'rxjs';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ButtonComponent],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">Balance des Comptes</h2>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 md:items-end">
        <div class="min-w-56">
          <p class="block text-sm text-slate-600 mb-1">Dossier actif</p>
          <p class="px-3 py-2 rounded border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800">
            {{ (companyName$ | async) ?? 'Aucun dossier sélectionné' }}
          </p>
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Date de début</label>
          <input type="date" [(ngModel)]="dateDebut" class="border border-slate-300 rounded p-2">
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Date de fin</label>
          <input type="date" [(ngModel)]="dateFin" class="border border-slate-300 rounded p-2">
        </div>
        <app-button (clicked)="loadBalance()" size="sm" [disabled]="isLoading || !selectedCompanyId">
          Générer la balance
        </app-button>
      </div>

      <app-table [data]="displayData" [columns]="columns" [isLoading]="isLoading"></app-table>

      <!-- Résultat et équilibre -->
      @if (!isLoading && displayData.length > 0) {
        <div class="mt-6 p-4 rounded-xl font-bold text-lg border"
             [ngClass]="{'bg-emerald-50 text-emerald-700 border-emerald-200': isBalanced, 'bg-red-50 text-red-700 border-red-200': !isBalanced}">
          <div class="flex justify-between">
            <span>Totaux (Débit / Crédit) : {{ totalDebit | number:'1.0-0' }} XOF / {{ totalCredit | number:'1.0-0' }} XOF</span>
            <span>Équilibre : {{ isBalanced ? '✓ OK' : '⚠ DÉSÉQUILIBRÉ' }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class BalanceComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private tenantContext = inject(TenantContextService);
  private balanceService = inject(BalanceService);

  companyName$ = this.tenantContext.companyName$;
  selectedCompanyId = '';
  dateDebut = `${new Date().getFullYear()}-01-01`;
  dateFin = new Date().toISOString().split('T')[0];
  isLoading = false;

  displayData: LigneBalance[] = [];
  totalDebit = 0;
  totalCredit = 0;
  isBalanced = false;

  columns: TableColumn[] = [
    { key: 'numeroCompte', label: 'N° Compte', type: 'text' },
    { key: 'intituleCompte', label: 'Intitulé', type: 'text' },
    { key: 'totalDebit', label: 'Mvt Débit', type: 'currency' },
    { key: 'totalCredit', label: 'Mvt Crédit', type: 'currency' },
    { key: 'soldeDebit', label: 'Solde Débiteur', type: 'currency' },
    { key: 'soldeCredit', label: 'Solde Créditeur', type: 'currency' }
  ];

  ngOnInit() {
    this.tenantContext.companyId$.pipe(
      filter((companyId): companyId is string => !!companyId),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(companyId => {
      this.selectedCompanyId = companyId;
      this.loadBalance();
    });
  }

  loadBalance() {
    if (!this.selectedCompanyId) {
      this.displayData = [];
      this.calculateTotals([]);
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.balanceService.getBalance(this.selectedCompanyId, this.dateDebut, this.dateFin).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      this.displayData = data.lignes;
      this.calculateTotals(data.lignes);
    });
  }

  private calculateTotals(data: LigneBalance[]) {
    this.totalDebit = data.reduce((acc, curr) => acc + curr.totalDebit, 0);
    this.totalCredit = data.reduce((acc, curr) => acc + curr.totalCredit, 0);
    this.isBalanced = Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  }
}
