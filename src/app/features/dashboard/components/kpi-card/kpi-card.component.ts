import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPI } from '../../models/dashboard.model';
import { IconComponent } from '@shared';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

        <div [class]="iconBgClass" class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-md">
          <app-icon [name]="iconName" size="lg"></app-icon>
        </div>
      </div>
    </div>
  `
})
export class KpiCardComponent implements OnChanges {
  @Input({ required: true }) data!: KPI;

  iconBgClass = '';
  iconName = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.computeVisuals();
    }
  }

  private computeVisuals(): void {
    this.iconName = this.computeIconName();
    this.iconBgClass = this.computeIconBgClass();
  }

  private computeIconName(): string {
    const legacyIconMap: Record<string, string> = {
      payments: 'banknote',
      account_balance_wallet: 'wallet',
      trending_down: 'trending-down',
      assessment: 'chart-no-axes-column-increasing'
    };

    return legacyIconMap[this.data.icon ?? ''] ?? this.data.icon ?? 'chart-column';
  }

  private computeIconBgClass(): string {
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
}
