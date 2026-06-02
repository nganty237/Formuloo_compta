import { Ecriture, JournalFilter, JournalStats } from '@core';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, forkJoin, of, delay } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ecritures`;

  getJournal(entrepriseId: string): Observable<Ecriture[]> {
    return this.http.get<Ecriture[]>(`${this.apiUrl}?entrepriseId=${entrepriseId}&_embed=lignes`);
  }

  getJournalFiltered(
    entrepriseId: string,
    filter: JournalFilter
  ): Observable<Ecriture[]> {
    let params = new HttpParams()
      .set('entrepriseId', entrepriseId)
      .set('_embed', 'lignes')
      .set('_sort', 'date')
      .set('_order', 'desc');

    if (filter.journalId) {
      params = params.set('journalId', filter.journalId);
    }
    if (filter.dateDebut) {
      params = params.set('date_gte', filter.dateDebut);
    }
    if (filter.dateFin) {
      params = params.set('date_lte', filter.dateFin);
    }
    if (filter.valideOnly) {
      params = params.set('valide', 'true');
    }

    return this.http.get<Ecriture[]>(this.apiUrl, { params }).pipe(
      map((entries: Ecriture[]) => {
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          return entries.filter(e =>
            e.libelle.toLowerCase().includes(term) ||
            e.id.toLowerCase().includes(term)
          );
        }
        return entries;
      })
    );
  }

  getJournalStats(entrepriseId: string, filter?: JournalFilter): Observable<JournalStats> {
    return this.getJournalFiltered(entrepriseId, filter || {}).pipe(
      map((entries: Ecriture[]) => {
        const allLines = entries.flatMap(e => e.lignes || []);
        const totalDebit = allLines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
        const totalCredit = allLines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);

        return {
          totalEntries: entries.length,
          totalDebit,
          totalCredit,
          isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
        };
      })
    );
  }

  getById(id: string): Observable<Ecriture | undefined> {
    return this.http.get<Ecriture>(`${this.apiUrl}/${id}?_embed=lignes`);
  }

  create(entry: Ecriture): Observable<Ecriture> {
    const { lignes, ...entryData } = entry;
    const newEntryData = {
      ...entryData,
      id: entryData.id || `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    return this.http.post<Ecriture>(this.apiUrl, newEntryData).pipe(
      switchMap(createdEntry => {
        if (!lignes || lignes.length === 0) {
          return of(createdEntry);
        }

        // Save each line to /lignes
        const lineRequests = lignes.map((line, index) => {
          const newLine = {
            ...line,
            id: `line-${createdEntry.id}-${index}`,
            ecritureId: createdEntry.id
          };
          return this.http.post(`${environment.apiUrl}/lignes`, newLine);
        });

        return forkJoin(lineRequests).pipe(
          map(() => ({ ...createdEntry, lignes }))
        );
      })
    );
  }

  update(id: string, entry: Partial<Ecriture>): Observable<Ecriture> {
    return this.http.patch<Ecriture>(`${this.apiUrl}/${id}`, entry);
  }

  validate(id: string): Observable<Ecriture> {
    return this.update(id, { valide: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exportData(entrepriseId: string, filter: JournalFilter): Observable<any> {
    // Simulation d'un export
    return of({ success: true, url: '#' }).pipe(delay(1000));
  }

  getGlobalStats(entrepriseId: string): Observable<any> {
    return this.getJournal(entrepriseId).pipe(
      map((entries: Ecriture[]) => {
        return {
          count: entries.length,
          totalDebit: entries.flatMap((e: Ecriture) => e.lignes || []).reduce((s: number, l: any) => s + (l.debit || 0), 0),
          totalCredit: entries.flatMap((e: Ecriture) => e.lignes || []).reduce((s: number, l: any) => s + (l.credit || 0), 0),
        };
      })
    );
  }
}
