import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, finalize, tap } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { 
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
  private expenseStructureSubject = new BehaviorSubject<ExpenseCategory[]>([]);
  private invoiceAgingSubject = new BehaviorSubject<InvoiceAging[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);


  public readonly kpis$ = this.kpisSubject.asObservable();
  public readonly cashFlow$ = this.cashFlowSubject.asObservable();
  public readonly expenseStructure$ = this.expenseStructureSubject.asObservable();
  public readonly invoiceAging$ = this.invoiceAgingSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();

  /**
   * Charge l'ensemble des données du dashboard
   * @param entrepriseId ID de l'entreprise active
   * @param annee Année fiscale (par défaut l'année en cours)
   */
  loadDashboard(entrepriseId: string, annee: number = new Date().getFullYear()): void {
    this.loadingSubject.next(true);

    combineLatest({
      kpis: this.apiService.getKPIs(entrepriseId),
      cashFlow: this.apiService.getCashFlow(entrepriseId, annee),
      expenseStructure: this.apiService.getExpenseStructure(entrepriseId),
      invoiceAging: this.apiService.getInvoiceAging(entrepriseId)
    })
    .pipe(
      tap(({ kpis, cashFlow, expenseStructure, invoiceAging }) => {
        this.kpisSubject.next(kpis);
        this.cashFlowSubject.next(cashFlow);
        this.expenseStructureSubject.next(expenseStructure);
        this.invoiceAgingSubject.next(invoiceAging);
      }),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe();
  }

  /**
   * Permet de rafraîchir manuellement les données
   */
  
  refresh(entrepriseId: string): void {
    this.loadDashboard(entrepriseId);
  }
}
