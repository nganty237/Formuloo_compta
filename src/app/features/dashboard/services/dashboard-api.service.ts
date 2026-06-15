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
  InvoiceAging,
  DashboardData
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private balanceService = inject(BalanceService);
  private entryService = inject(EntryService);
  private planService = inject(PlanComptableService);

  /**
   * Main method to load all dashboard data in a single efficient pass
   */
  loadDashboardData(entrepriseId: string, annee: number): Observable<DashboardData> {
    return combineLatest({
      entries: this.entryService.getAll(entrepriseId),
      accounts: this.planService.getAccounts(entrepriseId)
    }).pipe(
      map(({ entries, accounts }) => {
        return {
          kpis: this.computeKPIs(entries, accounts),
          cashFlow: this.computeCashFlow(entries, accounts, annee),
          accountingMovements: this.computeMovements(entries, annee),
          expenseStructure: this.computeExpenses(entries, accounts),
          invoiceAging: this.computeAging(entries, accounts)
        };
      })
    );
  }

  /**
   * Calculation helpers (Refactored from original methods)
   */

  private computeKPIs(entries: any[], accounts: any[]): KPI[] {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfYear = `${new Date().getFullYear()}-01-01`;
    const balances = this.calculateBalances(entries, accounts, firstDayOfYear, today);
    
    const ca = balances
      .filter((b: any) => b.numeroCompte.startsWith('7'))
      .reduce((acc: number, b: any) => acc + b.soldeCredit, 0);
      
    const tresorerie = balances
      .filter((b: any) => b.numeroCompte.startsWith('5'))
      .reduce((acc: number, b: any) => acc + (b.soldeDebit - b.soldeCredit), 0);

    const charges = balances
      .filter((b: any) => b.numeroCompte.startsWith('6'))
      .reduce((acc: number, b: any) => acc + b.soldeDebit, 0);

    return [
      { id: 'ca', title: 'Chiffre d\'Affaires', value: ca, trend: 'up', icon: 'banknote' },
      { id: 'cash', title: 'Trésorerie disponible', value: tresorerie, trend: 'up', icon: 'wallet' },
      { id: 'expenses', title: 'Charges d\'exploitation', value: charges, trend: 'down', icon: 'trending-down' },
      { id: 'profit', title: 'Résultat net (estimé)', value: ca - charges, trend: 'up', icon: 'chart-no-axes-column-increasing' }
    ] as KPI[];
  }

  private computeCashFlow(entries: any[], accounts: any[], annee: number): CashFlowPoint[] {
    const months = this.getMonthLabels();
    const cashFlowData: CashFlowPoint[] = months.map(month => ({
      month,
      inflows: 0,
      outflows: 0
    }));

    entries.forEach((entry: any) => {
      const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === annee) {
        const monthIdx = entryDate.getMonth();
        if (entry.lignes) {
          entry.lignes.forEach((ligne: any) => {
            const account = accounts.find((a: any) => a.id === ligne.compteId);
            if (account?.numero.startsWith('5')) {
              cashFlowData[monthIdx].inflows += (ligne.debit || 0);
              cashFlowData[monthIdx].outflows += (ligne.credit || 0);
            }
          });
        }
      }
    });

    return cashFlowData;
  }

  private computeMovements(entries: any[], annee: number): AccountingMovementPoint[] {
    const months = this.getMonthLabels();
    const movementData: AccountingMovementPoint[] = months.map(month => ({
      month,
      debit: 0,
      credit: 0
    }));

    entries.forEach((entry: any) => {
      const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === annee) {
        const monthIdx = entryDate.getMonth();
        if (entry.lignes) {
          entry.lignes.forEach((ligne: any) => {
            movementData[monthIdx].debit += (ligne.debit || 0);
            movementData[monthIdx].credit += (ligne.credit || 0);
          });
        }
      }
    });

    return movementData;
  }

  private computeExpenses(entries: any[], accounts: any[]): ExpenseCategory[] {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfYear = `${new Date().getFullYear()}-01-01`;
    const balances = this.calculateBalances(entries, accounts, firstDayOfYear, today);
    const categoriesMap = new Map<string, number>();

    balances
      .filter((b: any) => b.numeroCompte.startsWith('6'))
      .forEach((b: any) => {
        const subClass = b.numeroCompte.substring(0, 2);
        const label = this.getExpenseLabel(subClass);
        const current = categoriesMap.get(label) || 0;
        categoriesMap.set(label, current + (b.soldeDebit - b.soldeCredit));
      });

    return Array.from(categoriesMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .filter(cat => cat.amount > 0);
  }

  private computeAging(entries: any[], accounts: any[]): InvoiceAging[] {
    const aging: InvoiceAging[] = [];
    const today = new Date();

    entries.forEach((entry: any) => {
      if (entry.lignes) {
        entry.lignes.forEach((ligne: any) => {
          const account = accounts.find((a: any) => a.id === ligne.compteId);
          if (account?.numero.startsWith('411') && !ligne.lettrage && (ligne.debit || 0) > 0) {
            const entryDate = new Date(entry.date);
            const diffTime = today.getTime() - entryDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 30) {
              aging.push({
                customer: entry.libelle.split('N°')[0].trim() || 'Client Divers',
                invoice: entry.libelle.includes('N°') ? entry.libelle.split('N°')[1].trim() : `ENT-${entry.id.substring(0, 5)}`,
                date: entry.date,
                amount: (ligne.debit || 0),
                overdueDays: diffDays
              });
            }
          }
        });
      }
    });

    return aging.sort((a, b) => b.overdueDays - a.overdueDays).slice(0, 5);
  }

  /**
   * Utility to calculate balances from entries and accounts (replicates BalanceService logic)
   */
  private calculateBalances(entries: any[], accounts: any[], dateDebut: string, dateFin: string) {
    const mapBalance = new Map<string, any>();

    accounts.forEach(compte => {
      mapBalance.set(compte.id, {
        numeroCompte: compte.numero,
        totalDebit: 0,
        totalCredit: 0,
        soldeDebit: 0,
        soldeCredit: 0
      });
    });

    entries
      .filter(e => e.date >= dateDebut && e.date <= dateFin)
      .forEach(ecriture => {
        if (ecriture.lignes) {
          ecriture.lignes.forEach((ligne: any) => {
            const balanceLine = mapBalance.get(ligne.compteId);
            if (balanceLine) {
              balanceLine.totalDebit += (ligne.debit || 0);
              balanceLine.totalCredit += (ligne.credit || 0);
            }
          });
        }
      });

    return Array.from(mapBalance.values()).map(b => {
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
  }

  private getExpenseLabel(subClass: string): string {
    const labels: Record<string, string> = {
      '60': 'Achats', '61': 'Services Ext.', '62': 'Autres Services',
      '63': 'Impôts & Taxes', '64': 'Charges de Pers.', '65': 'Autres Charges',
      '66': 'Charges Financières', '67': 'Hors Act. Ordinaire', '68': 'Dotations Amort.', '69': 'Impôts Bénéfices'
    };
    return labels[subClass] || `Autres (${subClass})`;
  }

  private getMonthLabels(): string[] {
    return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  }
}
