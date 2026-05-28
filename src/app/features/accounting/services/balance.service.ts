import { Injectable, inject } from '@angular/core';
import { Observable, delay, map } from 'rxjs';
import { MOCK_ACCOUNTS } from '../../../core/mocks/mock-accounts';
import { EntryService } from './entry.service';

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
    private entryService = inject(EntryService);

    getBalance(entrepriseId: string, dateFin: string): Observable<LigneBalance[]> {
        return this.entryService.getAll(entrepriseId).pipe(
            map(entries => {
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

                entries.filter(e => e.date <= dateFin).forEach(ecriture => {
                    ecriture.lignes.forEach(ligne => {
                        const balanceLine = mapBalance.get(ligne.compteId);
                        if (balanceLine) {
                            balanceLine.totalDebit += ligne.debit;
                            balanceLine.totalCredit += ligne.credit;
                        }
                    });
                });

                const balances = Array.from(mapBalance.values()).map(b => {
                    if (b.totalDebit > b.totalCredit) {
                        b.soldeDebit = b.totalDebit - b.totalCredit;
                    } else if (b.totalCredit > b.totalDebit) {
                        b.soldeCredit = b.totalCredit - b.totalDebit;
                    }
                    return b;
                });

                return balances.filter(b => b.totalDebit > 0 || b.totalCredit > 0);
            }),
            delay(700)
        );
    }
}
