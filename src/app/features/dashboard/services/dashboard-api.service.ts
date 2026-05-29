import { Injectable, inject } from '@angular/core';
import { Observable, map, combineLatest, of } from 'rxjs';
import { BalanceService } from '../../accounting/services/balance.service';
import { EntryService } from '../../accounting/services/entry.service';
import { PlanComptableService } from '../../accounting/services/plan-comptable.service';
import {
  KPI,
  AccountingMovementPoint,
  CashFlowPoint,
  ExpenseCategory,
  InvoiceAging
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private balanceService = inject(BalanceService);
  private entryService = inject(EntryService);
  private planService = inject(PlanComptableService);

  /**
   * Get revenue, cash, expenses and profit KPIs from account balances
   */
  getKPIs(entrepriseId: string): Observable<KPI[]> {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfYear = `${new Date().getFullYear()}-01-01`;

    return this.balanceService.getBalance(entrepriseId, firstDayOfYear, today).pipe(
      map(data => {
        const balances = data.lignes;
        
        // CA: Somme des soldes créditeurs de la classe 7
        const ca = balances
          .filter(b => b.numeroCompte.startsWith('7'))
          .reduce((acc, b) => acc + b.soldeCredit, 0);
          
        // Trésorerie: Somme des soldes débiteurs de la classe 5 (moins créditeurs si découvert)
        const tresorerie = balances
          .filter(b => b.numeroCompte.startsWith('5'))
          .reduce((acc, b) => acc + (b.soldeDebit - b.soldeCredit), 0);

        // Charges: Somme des soldes débiteurs de la classe 6
        const charges = balances
          .filter(b => b.numeroCompte.startsWith('6'))
          .reduce((acc, b) => acc + b.soldeDebit, 0);

        return [
          { title: 'Chiffre d\'Affaires', value: ca, trend: 'up', icon: 'banknote' },
          { title: 'Trésorerie disponible', value: tresorerie, trend: 'up', icon: 'wallet' },
          { title: 'Charges d\'exploitation', value: charges, trend: 'down', icon: 'trending-down' },
          { title: 'Résultat net (estimé)', value: ca - charges, trend: 'up', icon: 'chart-no-axes-column-increasing' }
        ] as KPI[];
      })
    );
  }

  /**
   * Get monthly cash flow evolution (inflows/outflows) for a given year
   */
  getCashFlow(entrepriseId: string, annee: number): Observable<CashFlowPoint[]> {
    return combineLatest({
      entries: this.entryService.getAll(entrepriseId),
      accounts: this.planService.getAccounts(entrepriseId)
    }).pipe(
      map(({ entries, accounts }) => {
        const months = this.getMonthLabels();
        const cashFlowData: CashFlowPoint[] = months.map(month => ({
          month,
          inflows: 0,
          outflows: 0
        }));

        entries.forEach(entry => {
          const entryDate = new Date(entry.date);
          if (entryDate.getFullYear() === annee) {
            const monthIdx = entryDate.getMonth();

            entry.lignes.forEach(ligne => {
              const account = accounts.find(a => a.id === ligne.compteId);
              if (account?.numero.startsWith('5')) {
                cashFlowData[monthIdx].inflows += ligne.debit;
                cashFlowData[monthIdx].outflows += ligne.credit;
              }
            });
          }
        });

        return cashFlowData;
      })
    );
  }

  /**
   * Get all accounting debit/credit movements by month for a given year
   */
  getAccountingMovements(entrepriseId: string, annee: number): Observable<AccountingMovementPoint[]> {
    return this.entryService.getAll(entrepriseId).pipe(
      map(entries => {
        const months = this.getMonthLabels();
        const movementData: AccountingMovementPoint[] = months.map(month => ({
          month,
          debit: 0,
          credit: 0
        }));

        entries.forEach(entry => {
          const entryDate = new Date(entry.date);
          if (entryDate.getFullYear() === annee) {
            const monthIdx = entryDate.getMonth();

            entry.lignes.forEach(ligne => {
              movementData[monthIdx].debit += ligne.debit;
              movementData[monthIdx].credit += ligne.credit;
            });
          }
        });

        return movementData;
      })
    );
  }

  /**
   * Get expense breakdown by category (account class 6)
   */
  getExpenseStructure(entrepriseId: string): Observable<ExpenseCategory[]> {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfYear = `${new Date().getFullYear()}-01-01`;

    return this.balanceService.getBalance(entrepriseId, firstDayOfYear, today).pipe(
      map(data => {
        const balances = data.lignes;
        const categoriesMap = new Map<string, number>();

        balances
          .filter(b => b.numeroCompte.startsWith('6'))
          .forEach(b => {
            const subClass = b.numeroCompte.substring(0, 2);
            const label = this.getExpenseLabel(subClass);
            const current = categoriesMap.get(label) || 0;
            // On prend le solde débiteur pour les charges
            categoriesMap.set(label, current + (b.soldeDebit - b.soldeCredit));
          });

        return Array.from(categoriesMap.entries())
          .map(([category, amount]) => ({ category, amount }))
          .filter(cat => cat.amount > 0);
      })
    );
  }

  /**
   * Get aged customer invoices (account 411) overdue by more than 30 days
   */
  getInvoiceAging(entrepriseId: string): Observable<InvoiceAging[]> {
    return combineLatest({
      entries: this.entryService.getAll(entrepriseId),
      accounts: this.planService.getAccounts(entrepriseId)
    }).pipe(
      map(({ entries, accounts }) => {
        const aging: InvoiceAging[] = [];
        const today = new Date();

        entries.forEach(entry => {
          entry.lignes.forEach(ligne => {
            const account = accounts.find(a => a.id === ligne.compteId);
            // On cherche les factures impayées (lettrage vide sur le compte 411)
            if (account?.numero.startsWith('411') && !ligne.lettrage && ligne.debit > 0) {
              const entryDate = new Date(entry.date);
              const diffTime = today.getTime() - entryDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays > 30) {
                aging.push({
                  customer: entry.libelle.split('N°')[0].trim() || 'Client Divers',
                  invoice: entry.libelle.includes('N°') ? entry.libelle.split('N°')[1].trim() : `ENT-${entry.id.substring(0, 5)}`,
                  date: entry.date,
                  amount: ligne.debit,
                  overdueDays: diffDays
                });
              }
            }
          });
        });

        return aging.sort((a, b) => b.overdueDays - a.overdueDays).slice(0, 5);
      })
    );
  }

  private getExpenseLabel(subClass: string): string {
    const labels: Record<string, string> = {
      '60': 'Achats',
      '61': 'Services Ext.',
      '62': 'Autres Services',
      '63': 'Impôts & Taxes',
      '64': 'Charges de Pers.',
      '65': 'Autres Charges',
      '66': 'Charges Financières',
      '67': 'Hors Act. Ordinaire',
      '68': 'Dotations Amort.',
      '69': 'Impôts Bénéfices'
    };
    return labels[subClass] || `Autres (${subClass})`;
  }

  private getMonthLabels(): string[] {
    return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  }
}
