import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPI } from '../../models/dashboard.model';
import { IconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
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
          <app-icon [name]="getIconName()" size="lg"></app-icon>
        </div>
      </div>

      @if (isValidTrend()) {
        <div class="mt-4 pt-4 border-t border-slate-100">
          <span [class]="getTrendClass()" class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md">
            <app-icon
                 name="trending-down"
                 size="sm"
                 [className]="'mr-1 ' + (getTrendValue() < 0 ? 'rotate-180' : '')"></app-icon>
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

  getIconName(): string {
    const legacyIconMap: Record<string, string> = {
      payments: 'banknote',
      account_balance_wallet: 'wallet',
      trending_down: 'trending-down',
      assessment: 'chart-no-axes-column-increasing'
    };

    return legacyIconMap[this.data.icon ?? ''] ?? this.data.icon ?? 'chart-column';
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
