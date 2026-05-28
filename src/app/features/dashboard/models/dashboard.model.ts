/**
 * Interface pour les indicateurs clés de performance (KPI)
 */
export interface KPI {
  id: string;
  title: string;
  value: number;
  trend: 'up' | 'down';
  icon?: string;
}

/**
 * Interface pour les points du graphique de flux de trésorerie (CashFlow)
 */
export interface CashFlowPoint {
  month: string;
  inflows: number;
  outflows: number; 
}

/**
 * Interface pour les mouvements comptables mensuels
 */
export interface AccountingMovementPoint {
  month: string;
  debit: number;
  credit: number;
}

/**
 * Interface pour la répartition des charges par catégorie
 */
export interface ExpenseCategory {
  category: string;
  amount: number;
}

/**
 * Interface pour la balance âgée des factures (créances clients)
 */
export interface InvoiceAging {
  customer: string;
  invoice: string;
  date: string;
  amount: number;
  overdueDays: number;
}

/**
 * Interface globale regroupant toutes les données du dashboard
 */
export interface DashboardData {
  kpis: KPI[];
  cashFlow: CashFlowPoint[];
  accountingMovements: AccountingMovementPoint[];
  expenseStructure: ExpenseCategory[];
  invoiceAging: InvoiceAging[];
}
