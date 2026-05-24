import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { JournalEntry } from '../models/accounting.model';
import { MOCK_JOURNAL_ENTRIES } from '../../../core/mocks/mock-accounting';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {

  constructor() { }

  /*
   * recupere toutes les operations d'un tenant
  */
  getEntries(): Observable<JournalEntry[]> {
    return of(MOCK_JOURNAL_ENTRIES);
  }
}