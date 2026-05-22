import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { JournalEntry } from '../models/accounting.model';
import { MOCK_JOURNAL_ENTRIES } from '../../../core/mocks/mock-accounting';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {

  constructor() { }

  // Simule la récupération de la liste des écritures comptables
  getEntries(): Observable<JournalEntry[]> {
    // 'of()' transforme notre tableau en un flux Observable (comme si ça venait d'une API http.get)
    return of(MOCK_JOURNAL_ENTRIES);
  }
}