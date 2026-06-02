import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantContextService } from '@core';
import { BalanceService, LigneBalance } from '@features/accounting';
import { StatementTableComponent, StatementTableRow } from '@shared';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-compte-resultat',
  standalone: true,
  imports: [CommonModule, StatementTableComponent],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">Compte de Résultat (Période en cours)</h2>
      
      <div class="grid grid-cols-2 gap-6">
        <app-statement-table
          title="CHARGES (Dépenses)"
          totalLabel="Total Charges"
          tone="rose"
          [rows]="chargeRows"
          [total]="totalCharges">
        </app-statement-table>

        <app-statement-table
          title="PRODUITS (Recettes)"
          totalLabel="Total Produits"
          tone="emerald"
          [rows]="produitRows"
          [total]="totalProduits">
        </app-statement-table>
      </div>

      <div class="mt-8 p-6 rounded-xl border-2" [ngClass]="resultat >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'">
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-lg font-bold" [ngClass]="resultat >= 0 ? 'text-emerald-900' : 'text-rose-900'">
                    RÉSULTAT NET ({{ resultat >= 0 ? 'BÉNÉFICE' : 'PERTE' }})
                </h3>
                <p class="text-sm opacity-75">Calculé automatiquement : Total Produits - Total Charges</p>
            </div>
            <div class="text-3xl font-black" [ngClass]="resultat >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ resultat | number:'1.0-0' }} XOF
            </div>
        </div>
      </div>
    </div>
  `
})
export class CompteResultatComponent implements OnInit {
  private tenantContext = inject(TenantContextService);
  private balanceService = inject(BalanceService);

  today = new Date();
  charges: LigneBalance[] = [];
  produits: LigneBalance[] = [];
  chargeRows: StatementTableRow[] = [];
  produitRows: StatementTableRow[] = [];
  
  totalCharges = 0;
  totalProduits = 0;
  resultat = 0;

  ngOnInit() {
    this.tenantContext.companyId$.pipe(
      switchMap(companyId => {
        if (!companyId) return of(null);
        // On prend toute l'année en cours pour le résultat
        const year = this.today.getFullYear();
        return this.balanceService.getBalance(companyId, `${year}-01-01`, `${year}-12-31`);
      })
    ).subscribe(data => {
      if (!data) return;

      // Charges : Classe 6 + Classe 8 (si solde débiteur)
      this.charges = data.lignes.filter(d => 
        (d.numeroCompte.startsWith('6') || d.numeroCompte.startsWith('8')) && d.soldeDebit > 0
      );

      // Produits : Classe 7
      this.produits = data.lignes.filter(d => 
        d.numeroCompte.startsWith('7') && d.soldeCredit > 0
      );
      
      this.totalCharges = this.charges.reduce((sum, acc) => sum + acc.soldeDebit, 0);
      this.totalProduits = this.produits.reduce((sum, acc) => sum + acc.soldeCredit, 0);
      this.resultat = this.totalProduits - this.totalCharges;

      this.chargeRows = this.charges.map(acc => ({
        id: acc.compteId,
        label: `${acc.numeroCompte} - ${acc.intituleCompte}`,
        amount: acc.soldeDebit
      }));
      this.produitRows = this.produits.map(acc => ({
        id: acc.compteId,
        label: `${acc.numeroCompte} - ${acc.intituleCompte}`,
        amount: acc.soldeCredit
      }));
    });
  }
}
