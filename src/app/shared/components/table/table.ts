import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'status';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html'
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() isLoading: boolean = false;
}