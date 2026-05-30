import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Ecriture, JournalFilter, JournalStats } from '../../../core/models/ecriture.model';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private mockData = inject(MockDataService);

  get entries(): Ecriture[] {
    return this.mockData.entries;
  }

  getJournal(entrepriseId: string): Observable<Ecriture[]> {
    const data = this.mockData.entries.filter(e => e.entrepriseId === entrepriseId);
    return of(data).pipe(delay(500));
  }

  getJournalFiltered(
    entrepriseId: string,
    filter: JournalFilter
  ): Observable<Ecriture[]> {
    let filtered = this.mockData.entries.filter(e => e.entrepriseId === entrepriseId);

    if (filter.journalId) {
      filtered = filtered.filter(e => e.journalId === filter.journalId);
    }
    if (filter.dateDebut) {
      filtered = filtered.filter(e => e.date >= filter.dateDebut!);
    }
    if (filter.dateFin) {
      filtered = filtered.filter(e => e.date <= filter.dateFin!);
    }
    if (filter.valideOnly) {
      filtered = filtered.filter(e => e.valide);
    }
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.libelle.toLowerCase().includes(term) ||
        e.id.toLowerCase().includes(term)
      );
    }
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return of(filtered).pipe(delay(500));
  }

  getById(id: string): Observable<Ecriture | undefined> {
    const entry = this.mockData.entries.find(e => e.id === id);
    return of(entry).pipe(delay(300));
  }

  create(entry: Ecriture): Observable<Ecriture> {
    const newEntry: Ecriture = {
      ...entry,
      id: entry.id || `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user'
    };
    this.mockData.entries.push(newEntry);
    return of(newEntry).pipe(delay(500));
  }

  update(id: string, entry: Ecriture): Observable<Ecriture> {
    const idx = this.mockData.entries.findIndex(e => e.id === id);
    if (idx !== -1) {
        this.mockData.entries[idx] = { ...entry, id };
        return of(this.mockData.entries[idx]).pipe(delay(500));
    }
    throw new Error('Entry not found');
  }

  validate(id: string): Observable<Ecriture> {
    const entry = this.mockData.entries.find(e => e.id === id);
    if (!entry) throw new Error('Entry not found');
    entry.valide = true;
    return of(entry).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const idx = this.mockData.entries.findIndex(e => e.id === id);
    if (idx !== -1) {
        this.mockData.entries.splice(idx, 1);
        return of(true).pipe(delay(300));
    }
    return of(false);
  }

  getJournalStats(entrepriseId: string, filter?: JournalFilter): Observable<JournalStats> {
    return this.getJournalFiltered(entrepriseId, filter || {}).pipe(
      map(entries => {
        const allLines = entries.flatMap(e => e.lignes);
        const totalDebit = allLines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = allLines.reduce((sum, line) => sum + line.credit, 0);

        return {
          totalEntries: entries.length,
          totalDebit,
          totalCredit,
          isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
        };
      })
    );
  }

  exportData(
    entrepriseId: string,
    filter: JournalFilter
  ): Observable<{ entries: Ecriture[]; stats: JournalStats }> {
    return this.getJournalFiltered(entrepriseId, filter).pipe(
      map(entries => ({
        entries,
        stats: {
          totalEntries: entries.length,
          totalDebit: entries.flatMap(e => e.lignes).reduce((s, l) => s + l.debit, 0),
          totalCredit: entries.flatMap(e => e.lignes).reduce((s, l) => s + l.credit, 0),
          isBalanced: entries.flatMap(e => e.lignes)
            .reduce((sum, line) => sum + (line.debit - line.credit), 0) < 0.01
        }
      }))
    );
  }
}
