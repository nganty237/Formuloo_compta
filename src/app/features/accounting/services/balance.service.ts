import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, switchMap } from 'rxjs';
import { EntryService } from './entry.service';
import { PlanComptableService } from './plan-comptable.service';

export interface LigneBalance {
    compteId: string;
    numeroCompte: string;
    intituleCompte: string;
    classe: number;
    type: string;
    totalDebit: number;
    totalCredit: number;
    soldeDebit: number;
    soldeCredit: number;
}

export interface BalanceResult {
    lignes: LigneBalance[];
    totalMvtDebit: number;
    totalMvtCredit: number;
    totalSoldeDebit: number;
    totalSoldeCredit: number;
    isBalanced: boolean;
    classeGroups: ClasseGroup[];
}

export interface ClasseGroup {
    classe: number;
    label: string;
    totalMvtDebit: number;
    totalMvtCredit: number;
    totalSoldeDebit: number;
    totalSoldeCredit: number;
    lignes: LigneBalance[];
}

const CLASSE_LABELS: Record<number, string> = {
    1: 'Classe 1 — Ressources Durables',
    2: 'Classe 2 — Actif Immobilisé',
    3: 'Classe 3 — Stocks',
    4: 'Classe 4 — Tiers',
    5: 'Classe 5 — Trésorerie',
    6: 'Classe 6 — Charges',
    7: 'Classe 7 — Produits',
    8: 'Classe 8 — Autres Charges / Produits'
};

@Injectable({
    providedIn: 'root'
})
export class BalanceService {
    private entryService = inject(EntryService);
    private planService = inject(PlanComptableService);

    getBalance(entrepriseId: string, dateDebut: string, dateFin: string): Observable<BalanceResult> {
        return this.planService.getAccounts(entrepriseId).pipe(
            switchMap(accounts => {
                return this.entryService.getAll(entrepriseId).pipe(
                    map(entries => {
                        const mapBalance = new Map<string, LigneBalance>();

                        // Initialize all accounts for the company
                        accounts.forEach(compte => {
                            mapBalance.set(compte.id, {
                                compteId: compte.id,
                                numeroCompte: compte.numero,
                                intituleCompte: compte.intitule,
                                classe: compte.classe,
                                type: compte.type,
                                totalDebit: 0,
                                totalCredit: 0,
                                soldeDebit: 0,
                                soldeCredit: 0
                            });
                        });

                        // Accumulate movements within the date range
                        entries
                            .filter(e => e.date >= dateDebut && e.date <= dateFin)
                            .forEach(ecriture => {
                                ecriture.lignes.forEach(ligne => {
                                    const balanceLine = mapBalance.get(ligne.compteId);
                                    if (balanceLine) {
                                        balanceLine.totalDebit += ligne.debit;
                                        balanceLine.totalCredit += ligne.credit;
                                    }
                                });
                            });

                        // Compute solde debiteur/crediteur
                        const allLines = Array.from(mapBalance.values()).map(b => {
                            const diff = b.totalDebit - b.totalCredit;
                            if (diff > 0) {
                                b.soldeDebit = diff;
                                b.soldeCredit = 0;
                            } else if (diff < 0) {
                                b.soldeCredit = -diff;
                                b.soldeDebit = 0;
                            }
                            return b;
                        });

                        // Only keep accounts with movements
                        const activeLignes = allLines.filter(b => b.totalDebit > 0 || b.totalCredit > 0);

                        // Sort by account number
                        activeLignes.sort((a, b) => a.numeroCompte.localeCompare(b.numeroCompte));

                        // Group by class
                        const classeMap = new Map<number, LigneBalance[]>();
                        activeLignes.forEach(l => {
                            if (!classeMap.has(l.classe)) {
                                classeMap.set(l.classe, []);
                            }
                            classeMap.get(l.classe)!.push(l);
                        });

                        const classeGroups: ClasseGroup[] = Array.from(classeMap.entries())
                            .sort(([a], [b]) => a - b)
                            .map(([classe, lignes]) => ({
                                classe,
                                label: CLASSE_LABELS[classe] || `Classe ${classe}`,
                                totalMvtDebit: lignes.reduce((s, l) => s + l.totalDebit, 0),
                                totalMvtCredit: lignes.reduce((s, l) => s + l.totalCredit, 0),
                                totalSoldeDebit: lignes.reduce((s, l) => s + l.soldeDebit, 0),
                                totalSoldeCredit: lignes.reduce((s, l) => s + l.soldeCredit, 0),
                                lignes
                            }));

                        // Global totals
                        const totalMvtDebit = activeLignes.reduce((s, l) => s + l.totalDebit, 0);
                        const totalMvtCredit = activeLignes.reduce((s, l) => s + l.totalCredit, 0);
                        const totalSoldeDebit = activeLignes.reduce((s, l) => s + l.soldeDebit, 0);
                        const totalSoldeCredit = activeLignes.reduce((s, l) => s + l.soldeCredit, 0);

                        return {
                            lignes: activeLignes,
                            totalMvtDebit,
                            totalMvtCredit,
                            totalSoldeDebit,
                            totalSoldeCredit,
                            isBalanced: Math.abs(totalMvtDebit - totalMvtCredit) < 0.01,
                            classeGroups
                        };
                    })
                );
            }),
            delay(700)
        );
    }
}
