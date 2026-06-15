import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ExpenseCategory } from '../../models/dashboard.model';

@Component({
  selector: 'app-expense-structure-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full">
      <div class="mb-4">
        <h3 class="text-base font-semibold text-slate-900">Structure des Charges</h3>
        <p class="text-xs text-slate-400 font-medium">Répartition sectorielle des comptes d'exploitation (Classe 6)</p>
      </div>
      <div class="chart-container" style="position: relative; height:280px; width:100%">
        <canvas baseChart
                [data]="doughnutChartData"
                [options]="doughnutChartOptions"
                [type]="doughnutChartType">
        </canvas>
      </div>
    </div>
  `
})
export class ExpenseStructureChartComponent implements OnChanges {
  @Input({ required: true }) data: ExpenseCategory[] = [];

  public doughnutChartType: 'doughnut' = 'doughnut';

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#0f172a', '#2563eb', '#10b981', '#f59e0b', 
        '#64748b', '#818cf8', '#34d399', '#fbbf24'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { 
        display: true, 
        position: 'right',
        labels: { boxWidth: 10, padding: 15, font: { family: 'Inter', size: 11 } }
      },
      tooltip: { padding: 12, cornerRadius: 8 }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.doughnutChartData.labels = this.data.map(c => c.category);
      this.doughnutChartData.datasets[0].data = this.data.map(c => c.amount);
      this.doughnutChartData = { ...this.doughnutChartData };
    }
  }
}
