import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { BalanceService, LigneBalance } from '../../../accounting/services/balance.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-bilan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">Bilan au {{ today | date:'dd/MM/yyyy' }}</h2>
      
      <div class="grid grid-cols-2 gap-6">
        <!-- ACTIF -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-blue-50 px-4 py-3 border-b border-blue-100 font-bold text-blue-900">ACTIF (Possessions)</div>
          <table class="w-full text-left text-sm">
            <tbody>
              @for (acc of actifs; track acc.compteId) {
                <tr class="border-b border-slate-100 last:border-0">
                  <td class="p-3 text-slate-600">{{ acc.numeroCompte }} - {{ acc.intituleCompte }}</td>
                  <td class="p-3 text-right font-semibold text-slate-800">{{ acc.soldeDebit | number:'1.0-0' }} XOF</td>
                </tr>
              }
            </tbody>
            <tfoot class="bg-slate-50 font-bold text-slate-900">
              <tr>
                <td class="p-3">Total Actif</td>
                <td class="p-3 text-right">{{ totalActif | number:'1.0-0' }} XOF</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- PASSIF -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-amber-50 px-4 py-3 border-b border-amber-100 font-bold text-amber-900">PASSIF (Dettes & Capitaux)</div>
          <table class="w-full text-left text-sm">
            <tbody>
              @for (acc of passifs; track acc.compteId) {
                <tr class="border-b border-slate-100 last:border-0">
                  <td class="p-3 text-slate-600">{{ acc.numeroCompte }} - {{ acc.intituleCompte }}</td>
                  <td class="p-3 text-right font-semibold text-slate-800">{{ acc.soldeCredit | number:'1.0-0' }} XOF</td>
                </tr>
              }
            </tbody>
            <tfoot class="bg-slate-50 font-bold text-slate-900">
              <tr>
                <td class="p-3">Total Passif</td>
                <td class="p-3 text-right">{{ totalPassif | number:'1.0-0' }} XOF</td>
              </tr>
            </tfoot>
          </table>
        </div>
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
  
  totalActif = 0;
  totalPassif = 0;

  ngOnInit() {
    this.tenantContext.companyId$.pipe(
      switchMap(companyId => {
        if (!companyId) return of([]);
        return this.balanceService.getBalance(companyId, this.today.toISOString());
      })
    ).subscribe(data => {
      // Tri selon les règles du plan OHADA :
      // - Actif : Comptes de classe 2 (Immo), 3 (Stocks), 4 (Clients/Débiteurs), 5 (Trésorerie Actif) qui ont un solde débiteur.
      this.actifs = data.filter(d => 
        (d.numeroCompte.startsWith('2') || 
         d.numeroCompte.startsWith('3') || 
         (d.numeroCompte.startsWith('4') && d.soldeDebit > 0) || 
         d.numeroCompte.startsWith('5')) && d.soldeDebit > 0
      );

      // - Passif : Comptes de classe 1 (Capitaux), 4 (Fournisseurs/Créditeurs) qui ont un solde créditeur.
      this.passifs = data.filter(d => 
        (d.numeroCompte.startsWith('1') || 
         (d.numeroCompte.startsWith('4') && d.soldeCredit > 0)) && d.soldeCredit > 0
      );
      
      this.totalActif = this.actifs.reduce((sum, acc) => sum + acc.soldeDebit, 0);
      this.totalPassif = this.passifs.reduce((sum, acc) => sum + acc.soldeCredit, 0);
    });
  }
}