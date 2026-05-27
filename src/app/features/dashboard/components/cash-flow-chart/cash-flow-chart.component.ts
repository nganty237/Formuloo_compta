import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, ChartOptions } from 'chart.js';
import { CashFlowPoint } from '../../models/dashboard.model';

@Component({
  selector: 'app-cash-flow-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full">
      <div class="mb-4">
        <h3 class="text-base font-semibold text-slate-900">Flux de Trésorerie</h3>
        <p class="text-xs text-slate-400 font-medium">Comparatif des encaissements et décaissements de la période</p>
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
export class CashFlowChartComponent implements OnChanges {
  @Input({ required: true }) data: CashFlowPoint[] = [];

  public lineChartType: 'line' = 'line';

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Entrées',
        backgroundColor: 'rgba(16, 185, 129, 0.04)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#10b981',
        fill: true,
        tension: 0.38,
        borderWidth: 2
      },
      {
        data: [],
        label: 'Sorties',
        backgroundColor: 'rgba(244, 63, 94, 0.04)',
        borderColor: '#f43f5e',
        pointBackgroundColor: '#f43f5e',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#f43f5e',
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
    if (changes['data'] && this.data && this.data.length > 0) {
      this.lineChartData.labels = this.data.map(p => p.month);
      this.lineChartData.datasets[0].data = this.data.map(p => p.inflows);
      this.lineChartData.datasets[1].data = this.data.map(p => p.outflows);
      
      this.lineChartData = { ...this.lineChartData };
    }
  }
}