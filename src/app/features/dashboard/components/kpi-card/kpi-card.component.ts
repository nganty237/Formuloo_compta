import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPI } from '../../models/dashboard.model';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-5 rounded-lg border border-slate-200/80 shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md">

      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 overflow-hidden">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1 truncate">
            {{ data.title }}
          </span>
          <h3 class="text-2xl font-semibold text-slate-900 tracking-tight truncate">
            {{ data.value | number:'1.0-0' }} <span class="text-sm font-medium text-slate-400 ml-1">XOF</span>
          </h3>
        </div>

        <div [class]="getIconBgClass()" class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-md">
          @switch (data.icon) {
            @case ('payments') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.107c.707.14 1.474-.365 1.474-1.096V17.49c0-1.22-.696-2.305-1.81-2.81a4.75 4.75 0 0 0-4.59 0c-1.114.505-1.81 1.59-1.81 2.81v.366c0 .157.011.313.03.465a4.99 4.99 0 0 0-.03-.465v-.366c0-1.22-.696-2.305-1.81-2.81a4.75 4.75 0 0 0-4.59 0c-1.114.505-1.81 1.59-1.81 2.81v.366c0 .157.011.313.03.465a4.99 4.99 0 0 0-.03-.465v-.366c0-1.22-.696-2.305-1.81-2.81a4.75 4.75 0 0 0-4.59 0c-1.114.505-1.81 1.59-1.81 2.81v1.79c0 .73.767 1.236 1.474 1.095Z" />
              </svg>
            }
            @case ('account_balance_wallet') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12v6a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-6Z" />
              </svg>
            }
            @case ('trending_down') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.307a.5.5 0 0 0 .71 0l7.084-7.084V11.25m0-4.5h-4.5" />
              </svg>
            }
            @case ('assessment') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            }
            @default {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
            }
          }
        </div>
      </div>

      @if (isValidTrend()) {
        <div class="mt-4 pt-4 border-t border-slate-100">
          <span [class]="getTrendClass()" class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" 
                 class="w-3.5 h-3.5 mr-1" [class.rotate-180]="getTrendValue() < 0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.307a.5.5 0 0 0 .71 0l7.084-7.084V11.25m0-4.5h-4.5" />
            </svg>
            {{ Math.abs(getTrendValue()) }}%
          </span>
        </div>
      }
    </div>
  `
})
export class KpiCardComponent {
  @Input({ required: true }) data!: KPI;

  protected Math = Math;

  /**
   * Vérifie si la tendance existe et est bien un nombre exploitable (évite le NaN)
   */
  isValidTrend(): boolean {
    return this.data.trend !== undefined &&
           this.data.trend !== null &&
           !isNaN(Number(this.data.trend));
  }

  getTrendValue(): number {
    return Number(this.data.trend);
  }

  getIconBgClass(): string {
    const title = this.data.title.toLowerCase();
    if (title.includes('chiffre') || title.includes('ca') || title.includes('ventes')) {
      return 'bg-emerald-50 text-emerald-600';
    }
    if (title.includes('trésorerie') || title.includes('cash')) {
      return 'bg-blue-50 text-blue-600';
    }
    if (title.includes('charge') || title.includes('dépense') || title.includes('décaissement')) {
      return 'bg-rose-50 text-rose-600';
    }
    return 'bg-slate-50 text-slate-600';
  }

  getTrendClass(): string {
    const trendValue = this.getTrendValue();
    const isPositive = trendValue >= 0;
    const title = this.data.title.toLowerCase();

    // Une hausse de charge est négative pour l'entreprise (couleur rouge)
    if (title.includes('charge') || title.includes('dépense') || title.includes('décaissement')) {
      return isPositive ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700';
    }
    // Pour le reste (CA, Trésorerie), une hausse est positive (couleur verte)
    return isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700';
  }
}
