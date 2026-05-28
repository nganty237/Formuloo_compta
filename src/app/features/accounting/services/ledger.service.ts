import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MOCK_ENTRIES } from '../../../core/mocks/mock-entries';
import { LigneEcriture } from '../../../core/models/ligne-ecriture.model';

@Injectable({
    providedIn: 'root'
})
export class LedgerService {

    // Get all movements for a specific account within date range
    getGrandLivre(
        entrepriseId: string,
        compteId: string,
        dateDebut: string,
        dateFin: string
    ): Observable<LigneEcriture[]> {
        const lignes: LigneEcriture[] = [];

        MOCK_ENTRIES
            .filter(e =>
                e.entrepriseId === entrepriseId &&
                e.date >= dateDebut &&
                e.date <= dateFin
            )
            .forEach(ecriture => {
                const lignesConcernees = ecriture.lignes.filter(l => l.compteId === compteId);
                lignesConcernees.forEach(ligne => {
                    lignes.push({
                        ...ligne,
                        libelle: ecriture.libelle
                    });
                });
            });

        // Sort by entry date
        lignes.sort((a, b) => {
            const dateA = MOCK_ENTRIES.find(e => e.id === a.ecritureId)?.date || '';
            const dateB = MOCK_ENTRIES.find(e => e.id === b.ecritureId)?.date || '';
            return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

        return of(lignes).pipe(delay(500));
    }

    // Calculate account balance at a given date
    getAccountBalance(
        entrepriseId: string,
        compteId: string,
        dateFin: string
    ): Observable<{ soldeDebit: number; soldeCredit: number }> {
        const lignes: LigneEcriture[] = [];

        MOCK_ENTRIES
            .filter(e =>
                e.entrepriseId === entrepriseId &&
                e.date <= dateFin
            )
            .forEach(ecriture => {
                const lignesConcernees = ecriture.lignes.filter(l => l.compteId === compteId);
                lignes.push(...lignesConcernees);
            });

        const soldeDebit = lignes.reduce((sum, l) => sum + l.debit, 0);
        const soldeCredit = lignes.reduce((sum, l) => sum + l.credit, 0);

        return of({ soldeDebit, soldeCredit }).pipe(delay(300));
    }
}
