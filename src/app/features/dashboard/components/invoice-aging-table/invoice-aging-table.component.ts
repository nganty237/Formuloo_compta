import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared';
import { InvoiceAging } from '../../models/dashboard.model';

@Component({
  selector: 'app-invoice-aging-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100">
        <h3 class="text-base font-semibold text-slate-900">Créances Clients</h3>
        <p class="text-xs text-slate-400 font-medium">Analyse chronologique des retards de facturation clients</p>
      </div>
      <div class="p-2">
        <app-table 
          [data]="data" 
          [columns]="columns"
          [isLoading]="isLoading">
        </app-table>
      </div>
    </div>
  `
})
export class InvoiceAgingTableComponent {
  @Input({ required: true }) data: InvoiceAging[] = [];
  @Input() isLoading: boolean = false;

  public columns: TableColumn[] = [
    { key: 'customer', label: 'Client', type: 'text' },
    { key: 'invoice', label: 'N° Facture', type: 'text' },
    { key: 'date', label: 'Date d\'Émission', type: 'date' },
    { key: 'amount', label: 'Montant Dû', type: 'currency' },
    { key: 'delay', label: 'Jours de Retard', type: 'text' }
  ];
}
