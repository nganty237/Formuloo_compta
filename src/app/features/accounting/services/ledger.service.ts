import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MOCK_ENTRIES } from '../../../core/mocks/mock-entries';
import { LigneEcriture } from '../../../core/models/ligne-ecriture.model';

@Injectable({
    providedIn: 'root'
})
export class LedgerService {

    /*
     affiche les operations d'un compte specifique
    */

    getGrandLivre(entrepriseId: string, compteId: string, dateDebut: string, dateFin: string): Observable<LigneEcriture[]> {
        const lignes: LigneEcriture[] = [];

        // On parcourt les écritures pour extraire uniquement les lignes qui concernent notre compte.
        MOCK_ENTRIES.filter(e =>
            e.entrepriseId === entrepriseId &&
            e.date >= dateDebut &&
            e.date <= dateFin
        ).forEach(ecriture => {
            const lignesConcernees = ecriture.lignes.filter(l => l.compteId === compteId);
            lignes.push(...lignesConcernees);
        });

        return of(lignes).pipe(delay(700));
    }
}