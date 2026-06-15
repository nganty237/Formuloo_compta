import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardFacade } from '../../services/dashboard-facade.service';
import {  TenantContextService  } from '@core';

import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { AccountingMovementsChartComponent } from '../../components/accounting-movements-chart/accounting-movements-chart.component';
import { CashFlowChartComponent } from '../../components/cash-flow-chart/cash-flow-chart.component';
import { ExpenseStructureChartComponent } from '../../components/expense-structure-chart/expense-structure-chart.component';
import { InvoiceAgingTableComponent } from '../../components/invoice-aging-table/invoice-aging-table.component';
import { DashboardFiltersComponent } from '../../components/dashboard-filters/dashboard-filters.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    KpiCardComponent,
    AccountingMovementsChartComponent,
    CashFlowChartComponent,
    ExpenseStructureChartComponent,
    InvoiceAgingTableComponent,
    DashboardFiltersComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50/50 p-6 space-y-6">
      
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Tableau de Bord Financier</h1>
          <p class="text-sm text-slate-500 font-medium">Vue d'ensemble de la santé comptable</p>
        </div>
        <app-dashboard-filters (filterChange)="onFilterChange($event)"></app-dashboard-filters>
      </div>

      @if (isLoading$ | async) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4]; track i) {
            <div class="animate-pulse bg-white border border-slate-200 p-6 rounded-xl h-28"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          @if (facade.kpis$ | async; as kpis) {
            @for (kpi of kpis; track kpi.title) {
              <app-kpi-card [data]="kpi"></app-kpi-card>
            }
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @defer (on viewport) {
            <app-cash-flow-chart 
              [data]="(facade.cashFlow$ | async) || []">
            </app-cash-flow-chart>
          } @placeholder {
            <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-[340px] flex items-center justify-center">
              <div class="animate-pulse w-full h-full bg-slate-50 rounded-lg"></div>
            </div>
          }

          @defer (on viewport) {
            <app-accounting-movements-chart
              [data]="(facade.accountingMovements$ | async) || []">
            </app-accounting-movements-chart>
          } @placeholder {
            <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-[340px] flex items-center justify-center">
              <div class="animate-pulse w-full h-full bg-slate-50 rounded-lg"></div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @defer (on viewport) {
            <app-expense-structure-chart 
              [data]="(facade.expenseStructure$ | async) || []">
            </app-expense-structure-chart>
          } @placeholder {
            <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-[340px] flex items-center justify-center">
              <div class="animate-pulse w-full h-full bg-slate-50 rounded-lg"></div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1">
          @defer (on viewport) {
            <app-invoice-aging-table 
              [data]="(facade.invoiceAging$ | async) || []"
              [isLoading]="false">
            </app-invoice-aging-table>
          } @placeholder {
            <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-[200px] flex items-center justify-center">
              <div class="animate-pulse w-full h-full bg-slate-50 rounded-lg"></div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DashboardContainerComponent {
  public readonly facade = inject(DashboardFacade);
  private readonly tenantContext = inject(TenantContextService);

  readonly isLoading$: Observable<boolean> = this.facade.loading$;

  constructor() {
    this.tenantContext.companyId$.pipe(
      filter((id): id is string => !!id),
      takeUntilDestroyed()
    ).subscribe(id => {
      this.facade.loadDashboard(id);
    });
  }

  onFilterChange(filters: { dateDebut: string, dateFin: string }): void {
    // Logique de filtrage à implémenter dans la façade
  }
}
