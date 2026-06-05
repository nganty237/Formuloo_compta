import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, finalize, tap } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { 
  AccountingMovementPoint,
  KPI, 
  CashFlowPoint, 
  ExpenseCategory, 
  InvoiceAging 
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardFacade {
  private apiService = inject(DashboardApiService);

  private kpisSubject = new BehaviorSubject<KPI[]>([]);
  private cashFlowSubject = new BehaviorSubject<CashFlowPoint[]>([]);
  private accountingMovementsSubject = new BehaviorSubject<AccountingMovementPoint[]>([]);
  private expenseStructureSubject = new BehaviorSubject<ExpenseCategory[]>([]);
  private invoiceAgingSubject = new BehaviorSubject<InvoiceAging[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);


  public readonly kpis$ = this.kpisSubject.asObservable();
  public readonly cashFlow$ = this.cashFlowSubject.asObservable();
  public readonly accountingMovements$ = this.accountingMovementsSubject.asObservable();
  public readonly expenseStructure$ = this.expenseStructureSubject.asObservable();
  public readonly invoiceAging$ = this.invoiceAgingSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();

  /**
   * @param entrepriseId Active company ID
   * @param annee Fiscal year
   */
  loadDashboard(entrepriseId: string, annee: number = new Date().getFullYear()): void {
    this.loadingSubject.next(true);

    combineLatest({
      kpis: this.apiService.getKPIs(entrepriseId),
      cashFlow: this.apiService.getCashFlow(entrepriseId, annee),
      accountingMovements: this.apiService.getAccountingMovements(entrepriseId, annee),
      expenseStructure: this.apiService.getExpenseStructure(entrepriseId),
      invoiceAging: this.apiService.getInvoiceAging(entrepriseId)
    })
    .pipe(
      tap(({ kpis, cashFlow, accountingMovements, expenseStructure, invoiceAging }: { 
        kpis: KPI[], 
        cashFlow: CashFlowPoint[], 
        accountingMovements: AccountingMovementPoint[], 
        expenseStructure: ExpenseCategory[], 
        invoiceAging: InvoiceAging[] 
      }) => {
        this.kpisSubject.next(kpis);
        this.cashFlowSubject.next(cashFlow);
        this.accountingMovementsSubject.next(accountingMovements);
        this.expenseStructureSubject.next(expenseStructure);
        this.invoiceAgingSubject.next(invoiceAging);
      }),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe();
  }

  refresh(entrepriseId: string): void {
    this.loadDashboard(entrepriseId);
  }
}
