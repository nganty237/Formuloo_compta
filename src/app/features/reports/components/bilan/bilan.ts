import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantContextService } from '@core';
import { BalanceService, LigneBalance } from '@features/accounting';
import { StatementTableComponent, StatementTableRow } from '@shared';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-bilan',
  standalone: true,
  imports: [CommonModule, StatementTableComponent],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">Bilan au {{ today | date:'dd/MM/yyyy' }}</h2>
      
      <div class="grid grid-cols-2 gap-6">
        <app-statement-table
          title="ACTIF (Possessions)"
          totalLabel="Total Actif"
          tone="blue"
          [rows]="actifRows"
          [total]="totalActif">
        </app-statement-table>

        <app-statement-table
          title="PASSIF (Dettes & Capitaux)"
          totalLabel="Total Passif"
          tone="amber"
          [rows]="passifRows"
          [total]="totalPassif">
        </app-statement-table>
      </div>
    </div>
  `
})
export class BilanComponent implements OnInit {
  private tenantContext = inject(TenantContextService);
  private balanceService = inject(BalanceService);

  today = new Date();
  actifs: LigneBalance[] = [];
  passifs: LigneBalance[] = [];
  actifRows: StatementTableRow[] = [];
  passifRows: StatementTableRow[] = [];
  
  totalActif = 0;
  totalPassif = 0;

  ngOnInit() {
    this.tenantContext.companyId$.pipe(
      switchMap(companyId => {
        if (!companyId) return of(null);
        // On prend l'année en cours pour le bilan
        const year = this.today.getFullYear();
        return this.balanceService.getBalance(companyId, `${year}-01-01`, `${year}-12-31`);
      })
    ).subscribe(data => {
      if (!data) return;

      // Tri selon les règles du plan OHADA :
      // - Actif : Comptes de classe 2 (Immo), 3 (Stocks), 4 (Clients/Débiteurs), 5 (Trésorerie Actif) qui ont un solde débiteur.
      this.actifs = data.lignes.filter(d => 
        (d.numeroCompte.startsWith('2') || 
         d.numeroCompte.startsWith('3') || 
         (d.numeroCompte.startsWith('4') && d.soldeDebit > 0) || 
         d.numeroCompte.startsWith('5')) && d.soldeDebit > 0
      );

      // - Passif : Comptes de classe 1 (Capitaux), 4 (Fournisseurs/Créditeurs) qui ont un solde créditeur.
      this.passifs = data.lignes.filter(d => 
        (d.numeroCompte.startsWith('1') || 
         (d.numeroCompte.startsWith('4') && d.soldeCredit > 0)) && d.soldeCredit > 0
      );
      
      this.totalActif = this.actifs.reduce((sum, acc) => sum + acc.soldeDebit, 0);
      this.totalPassif = this.passifs.reduce((sum, acc) => sum + acc.soldeCredit, 0);
      this.actifRows = this.actifs.map(acc => ({
        id: acc.compteId,
        label: `${acc.numeroCompte} - ${acc.intituleCompte}`,
        amount: acc.soldeDebit
      }));
      this.passifRows = this.passifs.map(acc => ({
        id: acc.compteId,
        label: `${acc.numeroCompte} - ${acc.intituleCompte}`,
        amount: acc.soldeCredit
      }));
    });
  }
}
