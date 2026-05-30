import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ecriture } from '../../../core/models/ecriture.model';
import { JournalService } from './journal.service';

@Injectable({
    providedIn: 'root'
})
export class EntryService {
    private journalService = inject(JournalService);

    // Get all entries for a specific company
    getAll(entrepriseId: string): Observable<Ecriture[]> {
        return this.journalService.getJournal(entrepriseId);
    }

    // Get a single entry by ID
    getById(id: string): Observable<Ecriture | undefined> {
        return this.journalService.getById(id);
    }

    // Create a new entry
    create(entry: Ecriture): Observable<Ecriture> {
        return this.journalService.create(entry);
    }

    // Update an existing entry
    update(id: string, entry: Ecriture): Observable<Ecriture> {
        return this.journalService.update(id, entry);
    }

    // Delete an entry
    delete(id: string): Observable<boolean> {
        return this.journalService.delete(id);
    }
}
