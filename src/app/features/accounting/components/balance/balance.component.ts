import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { BalanceService, LigneBalance } from '../../services/balance.service'; // Utilise votre service et interface existante
import { TableComponent, TableColumn } from '../../../../shared/components/table/table';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">Balance des Comptes</h2>
      
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-end">
        <div>
          <label class="block text-sm text-slate-600 mb-1">Date de fin</label>
          <input type="date" [(ngModel)]="dateFin" class="border border-slate-300 rounded p-2">
        </div>
        <button (click)="loadBalance()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Générer la balance
        </button>
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
  private tenantContext = inject(TenantContextService);
  private balanceService = inject(BalanceService);

  dateFin = new Date().toISOString().split('T')[0];
  isLoading = false;
  
  displayData: LigneBalance[] = [];
  totalDebit = 0;
  totalCredit = 0;
  isBalanced = false;

  // On adapte les clés aux propriétés de votre LigneBalance existante !
  columns: TableColumn[] = [
    { key: 'numeroCompte', label: 'N° Compte', type: 'text' },
    { key: 'intituleCompte', label: 'Intitulé', type: 'text' },
    { key: 'totalDebit', label: 'Mvt Débit', type: 'currency' },
    { key: 'totalCredit', label: 'Mvt Crédit', type: 'currency' },
    { key: 'soldeDebit', label: 'Solde Débiteur', type: 'currency' },
    { key: 'soldeCredit', label: 'Solde Créditeur', type: 'currency' }
  ];

  ngOnInit() {
    this.loadBalance();
  }

  loadBalance() {
    this.isLoading = true;
    this.tenantContext.companyId$.pipe(
      switchMap(companyId => {
        if (!companyId) return of([]);
        return this.balanceService.getBalance(companyId, this.dateFin);
      })
    ).subscribe(data => {
      this.displayData = data;
      this.calculateTotals(data);
      this.isLoading = false;
    });
  }

  private calculateTotals(data: LigneBalance[]) {
    this.totalDebit = data.reduce((acc, curr) => acc + curr.totalDebit, 0);
    this.totalCredit = data.reduce((acc, curr) => acc + curr.totalCredit, 0);
    this.isBalanced = this.totalDebit === this.totalCredit;
  }
}