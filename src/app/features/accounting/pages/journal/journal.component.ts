import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { TenantContextService, Ecriture, JournalFilter, JournalStats } from '@core';
import { TableComponent, TableColumn, ButtonComponent, IconComponent } from '@shared';
import * as JournalActions from '../../store/journal.actions';
import {
  selectExportLoading,
  selectFilteredEntries,
  selectJournalLoading,
  selectJournalStats,
} from '../../store/journal.selectors';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ButtonComponent, IconComponent],
  template: `
    <div class="p-8">
      <div class="bg-gradient-to-r from-blue-700 to-slate-800 rounded-xl p-8 text-white shadow-md mb-8">
        <h1 class="text-3xl font-bold mb-2 flex items-center gap-3">
          <app-icon name="file-text" size="lg"></app-icon>
          Accounting Journal
        </h1>
        <p class="text-blue-100">View all recorded entries and validate your transactions.</p>
      </div>

      @if (stats$ | async; as stats) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-sm text-slate-600 font-medium">Total Entries</div>
            <div class="text-3xl font-bold text-slate-900 mt-2">{{ stats.totalEntries }}</div>
            <div class="text-xs text-slate-500 mt-2">Recorded transactions</div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-sm text-slate-600 font-medium">Total Debits</div>
            <div class="text-3xl font-bold text-emerald-600 mt-2">{{ (stats.totalDebit | number:'1.0-0') }} XOF</div>
            <div class="text-xs text-emerald-600 mt-2">Debit movements</div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-sm text-slate-600 font-medium">Total Credits</div>
            <div class="text-3xl font-bold text-blue-600 mt-2">{{ (stats.totalCredit | number:'1.0-0') }} XOF</div>
            <div class="text-xs text-blue-600 mt-2">Credit movements</div>
          </div>

          <div [ngClass]="{
            'bg-emerald-50 border-emerald-200': stats.isBalanced,
            'bg-red-50 border-red-200': !stats.isBalanced
          }" class="p-6 rounded-xl border shadow-sm">
            <div class="text-sm font-medium" [ngClass]="stats.isBalanced ? 'text-emerald-700' : 'text-red-700'">
              Accounting Balance
            </div>
            <div class="text-2xl font-bold mt-2" [ngClass]="stats.isBalanced ? 'text-emerald-600' : 'text-red-600'">
              {{ stats.isBalanced ? 'BALANCED' : 'UNBALANCED' }}
            </div>
            <div class="text-xs mt-2" [ngClass]="stats.isBalanced ? 'text-emerald-600' : 'text-red-600'">
              Debit = Credit
            </div>
          </div>
        </div>
      }

      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <app-icon name="funnel"></app-icon>
          Filters
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Journal</label>
            <select (change)="onJournalChange($event)" class="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="">All journals</option>
              <option value="ACH">Purchases (ACH)</option>
              <option value="VTE">Sales (VTE)</option>
              <option value="BQ">Bank (BQ)</option>
              <option value="OD">Other (OD)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">From</label>
            <input type="date" [(ngModel)]="filter.dateDebut" (change)="applyFilter()"
                   class="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">To</label>
            <input type="date" [(ngModel)]="filter.dateFin" (change)="applyFilter()"
                   class="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Status</label>
            <select (change)="onValidityChange($event)" class="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="">All</option>
              <option value="valid">Validated</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Search</label>
            <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()"
                   placeholder="Description..."
                   class="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <app-table
          [data]="(entries$ | async) || []"
          [columns]="columns"
          [isLoading]="(loading$ | async) || false">
        </app-table>
      </div>

      @if ((entries$ | async)?.length) {
        <div class="mt-8 flex flex-wrap gap-4">
          <app-button (clicked)="exportToPDF()"
                  [disabled]="(exportLoading$ | async) ?? false"
                  variant="danger">
            <app-icon name="file-text" size="sm"></app-icon>
            Export PDF
          </app-button>
          <app-button (clicked)="exportToExcel()"
                  [disabled]="(exportLoading$ | async) ?? false"
                  variant="success">
            <app-icon name="file-spreadsheet" size="sm"></app-icon>
            Export Excel
          </app-button>
        </div>
      }
    </div>
  `
})
export class JournalComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private tenantContext = inject(TenantContextService);
  private destroy$ = new Subject<void>();

  entries$: Observable<Ecriture[] | null> = this.store.select(selectFilteredEntries);
  stats$: Observable<JournalStats | null> = this.store.select(selectJournalStats);
  loading$: Observable<boolean | null> = this.store.select(selectJournalLoading);
  exportLoading$: Observable<boolean | null> = this.store.select(selectExportLoading);

  filter: JournalFilter = {};
  searchTerm: string = '';

  columns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'journalId', label: 'Journal', type: 'text' },
    { key: 'libelle', label: 'Libelle', type: 'text' },
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'valide', label: 'Validee', type: 'status' }
  ];

  ngOnInit() {
    this.tenantContext.companyId$
      .pipe(
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe(companyId => {
        if (companyId) {
          this.store.dispatch(JournalActions.loadJournal({ entrepriseId: companyId }));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onJournalChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.filter.journalId = target.value || undefined;
    this.applyFilter();
  }

  onValidityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.filter.valideOnly = target.value === 'valid' ? true : undefined;
    this.applyFilter();
  }

  onSearch() {
    this.filter.searchTerm = this.searchTerm;
    this.applyFilter();
  }

  applyFilter() {
    this.tenantContext.companyId$
      .pipe(
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe((companyId: string | null) => {
        if (companyId) {
          this.store.dispatch(
            JournalActions.applyJournalFilter({
              entrepriseId: companyId,
              filter: this.filter
            })
          );
        }
      });
  }

  exportToPDF() {
    this.tenantContext.companyId$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((companyId: string | null) => {
        if (companyId) {
          this.store.dispatch(
            JournalActions.exportJournal({
              entrepriseId: companyId,
              filter: this.filter,
              format: 'pdf'
            })
          );
        }
      });
  }

  exportToExcel() {
    this.tenantContext.companyId$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((companyId: string | null) => {
        if (companyId) {
          this.store.dispatch(
            JournalActions.exportJournal({
              entrepriseId: companyId,
              filter: this.filter,
              format: 'excel'
            })
          );
        }
      });
  }
}
