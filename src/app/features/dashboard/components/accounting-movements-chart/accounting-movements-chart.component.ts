import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { AccountingMovementPoint } from '../../models/dashboard.model';

@Component({
  selector: 'app-accounting-movements-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full">
      <div class="mb-4">
        <h3 class="text-base font-semibold text-slate-900">Mouvements comptables</h3>
        <p class="text-xs text-slate-400 font-medium">Total mensuel des debits et credits saisis</p>
      </div>
      <div class="chart-container" style="position: relative; height:280px; width:100%">
        <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="lineChartType">
        </canvas>
      </div>
    </div>
  `
})
export class AccountingMovementsChartComponent implements OnChanges {
  @Input({ required: true }) data: AccountingMovementPoint[] = [];

  public lineChartType: 'line' = 'line';

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Debits',
        backgroundColor: 'rgba(37, 99, 235, 0.04)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#2563eb',
        fill: true,
        tension: 0.38,
        borderWidth: 2
      },
      {
        data: [],
        label: 'Credits',
        backgroundColor: 'rgba(14, 165, 233, 0.04)',
        borderColor: '#0ea5e9',
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#0ea5e9',
        fill: true,
        tension: 0.38,
        borderWidth: 2
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { boxWidth: 12, font: { family: 'Inter, sans-serif', size: 12 }, padding: 20 }
      },
      tooltip: { padding: 12, cornerRadius: 8, usePointStyle: true }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
      y: {
        grid: { color: '#f1f5f9' },
        beginAtZero: true,
        ticks: { font: { size: 11 }, color: '#94a3b8', callback: (val) => Number(val).toLocaleString() }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.lineChartData.labels = this.data.map(p => p.month);
      this.lineChartData.datasets[0].data = this.data.map(p => p.debit);
      this.lineChartData.datasets[1].data = this.data.map(p => p.credit);

      this.lineChartData = { ...this.lineChartData };
    }
  }
}
