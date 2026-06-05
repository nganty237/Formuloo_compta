import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map, switchMap } from 'rxjs';
import { EntryService } from './entry.service';
import { PlanComptableService } from './plan-comptable.service';

export interface LigneLedger {
    ligneId: string;
    ecritureId: string;
    date: string;
    journal: string;
    libelle: string;
    debit: number;
    credit: number;
    soldeProgressif: number;
    lettrage?: string;
}

export interface LedgerResult {
    compteId: string;
    numeroCompte: string;
    intituleCompte: string;
    type: string;
    lignes: LigneLedger[];
    totalDebit: number;
    totalCredit: number;
    soldeFinal: number;
}

const JOURNAL_LABELS: Record<string, string> = {
    ACH: 'Achats',
    VTE: 'Ventes',
    BQ: 'Banque',
    OD: 'Opérations Div.'
};

@Injectable({
    providedIn: 'root'
})
export class LedgerService {
    private entryService = inject(EntryService);
    private planService = inject(PlanComptableService);

    /**
     * Get all movements for a specific account within a date range,
     * including running balance (solde progressif).
     */
    getGrandLivre(
        entrepriseId: string,
        compteId: string,
        dateDebut: string,
        dateFin: string
    ): Observable<LedgerResult | null> {
        return this.planService.getAccounts(entrepriseId).pipe(
            map(accounts => accounts.find(a => a.id === compteId)),
            switchMap(account => {
                if (!account) return of(null);

                return this.entryService.getAll(entrepriseId).pipe(
                    map(entries => {
                        const rawLines: { ligne: any; ecriture: any }[] = [];

                        entries
                            .filter(e =>
                                e.date >= dateDebut &&
                                e.date <= dateFin
                            )
                            .forEach(ecriture => {
                                ecriture.lignes
                                    .filter(l => l.compteId === compteId)
                                    .forEach(ligne => {
                                        rawLines.push({ ligne, ecriture });
                                    });
                            });

                        rawLines.sort((a, b) => {
                            const dateDiff = new Date(a.ecriture.date).getTime() - new Date(b.ecriture.date).getTime();
                            if (dateDiff !== 0) return dateDiff;
                            return a.ecriture.id.localeCompare(b.ecriture.id);
                        });

                        let soldeProgressif = 0;
                        let totalDebit = 0;
                        let totalCredit = 0;

                        const lignes: LigneLedger[] = rawLines.map(({ ligne, ecriture }) => {
                            totalDebit += ligne.debit;
                            totalCredit += ligne.credit;
                            soldeProgressif += ligne.debit - ligne.credit;

                            return {
                                ligneId: ligne.id,
                                ecritureId: ecriture.id,
                                date: ecriture.date,
                                journal: JOURNAL_LABELS[ecriture.journalId] || ecriture.journalId,
                                libelle: ecriture.libelle,
                                debit: ligne.debit,
                                credit: ligne.credit,
                                soldeProgressif,
                                lettrage: ligne.lettrage
                            };
                        });

                        return {
                            compteId: account.id,
                            numeroCompte: account.numero,
                            intituleCompte: account.intitule,
                            type: account.type,
                            lignes,
                            totalDebit,
                            totalCredit,
                            soldeFinal: soldeProgressif
                        };
                    })
                );
            }),
            delay(500)
        );
    }
}
