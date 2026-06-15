import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, finalize, tap } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { 
  AccountingMovementPoint,
  KPI, 
  CashFlowPoint, 
  ExpenseCategory, 
  InvoiceAging,
  DashboardData
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
    // Reset subjects to avoid stale data flashes
    this.kpisSubject.next([]);
    this.cashFlowSubject.next([]);
    this.accountingMovementsSubject.next([]);
    this.expenseStructureSubject.next([]);
    this.invoiceAgingSubject.next([]);
    
    this.loadingSubject.next(true);

    this.apiService.loadDashboardData(entrepriseId, annee)
    .pipe(
      tap((data: DashboardData) => {
        this.kpisSubject.next(data.kpis);
        this.cashFlowSubject.next(data.cashFlow);
        this.accountingMovementsSubject.next(data.accountingMovements);
        this.expenseStructureSubject.next(data.expenseStructure);
        this.invoiceAgingSubject.next(data.invoiceAging);
      }),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe();
  }

  refresh(entrepriseId: string): void {
    this.loadDashboard(entrepriseId);
  }
}
