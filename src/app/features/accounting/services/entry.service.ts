import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Ecriture } from '../../../core/models/ecriture.model';
import { MOCK_ENTRIES } from '../../../core/mocks/mock-entries';

@Injectable({
    providedIn: 'root'
})
export class EntryService {
    private entries: Ecriture[] = [...MOCK_ENTRIES];

    /*
     recupere toutes les operations d'un tenant 
    */
    getAll(entrepriseId: string): Observable<Ecriture[]> {
        const data = this.entries.filter(e => e.entrepriseId === entrepriseId);
        return of(data).pipe(delay(700));
    }
    /*
     recupere une operation par son id
    */
    getById(id: string): Observable<Ecriture | undefined> {
        const entry = this.entries.find(e => e.id === id);
        return of(entry).pipe(delay(700));
    }

    /*
     cree une operation
    */
    create(entry: Ecriture): Observable<Ecriture> {
        const newEntry = { ...entry, id: `entry-${Date.now()}` };
        this.entries = [...this.entries, newEntry];
        return of(newEntry).pipe(delay(700));
    }

    /*
     modifie une operation
    */
    update(id: string, entry: Ecriture): Observable<Ecriture> {
        this.entries = this.entries.map(e => e.id === id ? { ...entry, id } : e);
        return of({ ...entry, id }).pipe(delay(700));
    }

    /*
     supprime une operation
    */
    delete(id: string): Observable<boolean> {
        this.entries = this.entries.filter(e => e.id !== id);
        return of(true).pipe(delay(700));
    }
}