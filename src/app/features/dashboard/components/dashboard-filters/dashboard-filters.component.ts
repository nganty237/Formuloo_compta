import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { IconComponent } from '../../../../shared/components/icon/icon';

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
  @Output() filterChange = new EventEmitter<{dateDebut: string, dateFin: string}>();

  dateDebut: string = '';
  dateFin: string = '';

  ngOnInit(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Formatage YYYY-MM-DD local pour éviter les décalages de fuseau horaire
    this.dateDebut = this.formatDate(firstDay);
    this.dateFin = this.formatDate(now);
  }

  applyFilters(): void {
    if (this.dateDebut && this.dateFin) {
      this.filterChange.emit({ dateDebut: this.dateDebut, dateFin: this.dateFin });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
