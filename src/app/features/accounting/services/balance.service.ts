import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MOCK_ENTRIES } from '../../../core/mocks/mock-entries';
import { MOCK_ACCOUNTS } from '../../../core/mocks/mock-accounts';

export interface LigneBalance {
    compteId: string;
    numeroCompte: string;
    intituleCompte: string;
    totalDebit: number;
    totalCredit: number;
    soldeDebit: number;
    soldeCredit: number;
}

@Injectable({
    providedIn: 'root'
})
export class BalanceService {

    getBalance(entrepriseId: string, dateFin: string): Observable<LigneBalance[]> {

        const mapBalance = new Map<string, LigneBalance>();

        MOCK_ACCOUNTS.filter(a => a.entrepriseId === entrepriseId).forEach(compte => {
            mapBalance.set(compte.id, {
                compteId: compte.id,
                numeroCompte: compte.numero,
                intituleCompte: compte.intitule,
                totalDebit: 0,
                totalCredit: 0,
                soldeDebit: 0,
                soldeCredit: 0
            });
        });

        //permet de parcourir les opérations et cumuler les mouvements
        MOCK_ENTRIES.filter(e => e.entrepriseId === entrepriseId && e.date <= dateFin).forEach(ecriture => {
            ecriture.lignes.forEach(ligne => {
                const balanceLine = mapBalance.get(ligne.compteId);
                if (balanceLine) {
                    balanceLine.totalDebit += ligne.debit;
                    balanceLine.totalCredit += ligne.credit;
                }
            });
        });

        //permet de calculer les soldes finaux de chaque compte
        const balances = Array.from(mapBalance.values()).map(b => {
            if (b.totalDebit > b.totalCredit) {
                b.soldeDebit = b.totalDebit - b.totalCredit;
            } else if (b.totalCredit > b.totalDebit) {
                b.soldeCredit = b.totalCredit - b.totalDebit;
            }
            return b;
        });

        // permet de garder seulement les comptes qui ont eu du mouvement
        const balancesActives = balances.filter(b => b.totalDebit > 0 || b.totalCredit > 0);

        return of(balancesActives).pipe(delay(700));
    }
}