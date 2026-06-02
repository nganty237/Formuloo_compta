import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent } from '@shared';

@Component({
  selector: 'app-dashboard-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent],
  template: `
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-end gap-4">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date Début</label>
        <div class="relative">
          <input type="date" [(ngModel)]="dateDebut"
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10">
        </div>
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date Fin</label>
        <div class="relative">
          <input type="date" [(ngModel)]="dateFin"
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10">
        </div>
      </div>
      <app-button (clicked)="applyFilters()" customClass="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/20 active:scale-[0.98] h-[38px]">
        <app-icon name="funnel" size="sm" className="mr-2"></app-icon>
        Filtrer les données
      </app-button>
    </div>
  `
})
export class DashboardFiltersComponent implements OnInit {
  @Output() filterChange = new EventEmitter<{ dateDebut: string, dateFin: string }>();

  dateDebut: string = '';
  dateFin: string = '';

  ngOnInit() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), 0, 1);
    this.dateDebut = firstDay.toISOString().split('T')[0];
    this.dateFin = today.toISOString().split('T')[0];
  }

  applyFilters() {
    this.filterChange.emit({
      dateDebut: this.dateDebut,
      dateFin: this.dateFin
    });
  }
}
