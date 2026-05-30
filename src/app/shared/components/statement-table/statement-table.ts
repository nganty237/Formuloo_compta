import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface StatementTableRow {
  id: string;
  label: string;
  amount: number;
}

type StatementTone = 'blue' | 'amber' | 'rose' | 'emerald';

@Component({
  selector: 'app-statement-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './statement-table.html'
})
export class StatementTableComponent {
  @Input() title = '';
  @Input() totalLabel = 'Total';
  @Input() total = 0;
  @Input() rows: StatementTableRow[] = [];
  @Input() tone: StatementTone = 'blue';

  get headerClasses(): string {
    const tones: Record<StatementTone, string> = {
      blue: 'bg-blue-50 border-blue-100 text-blue-900',
      amber: 'bg-amber-50 border-amber-100 text-amber-900',
      rose: 'bg-rose-50 border-rose-100 text-rose-900',
      emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900'
    };

    return `px-4 py-3 border-b font-bold ${tones[this.tone]}`;
  }
}
