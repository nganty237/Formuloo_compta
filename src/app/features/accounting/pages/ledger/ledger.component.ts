import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { LedgerService, LedgerResult, LigneLedger } from '../../services/ledger.service';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner';
import { PlanComptableService } from '../../services/plan-comptable.service';
import { distinctUntilChanged, filter, finalize, of, switchMap, timeout, catchError } from 'rxjs';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, SpinnerComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-[1400px] mx-auto">

      <!-- Header -->
      <div class="relative overflow-hidden rounded-2xl p-8 mb-8 shadow-lg"
           style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2847 50%, #0a1f3d 100%);">
        <div class="absolute inset-0 opacity-10"
             style="background-image: radial-gradient(circle at 20% 50%, rgba(59,130,246,0.5) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(99,102,241,0.3) 0%, transparent 40%);"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center text-xl">📖</div>
            <h1 class="text-3xl font-bold text-white tracking-tight">Grand Livre</h1>
          </div>
          <p class="text-blue-200/80 text-base max-w-2xl">
            Consultez le détail des mouvements par compte comptable OHADA avec le calcul dynamique du solde progressif.
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
        <div class="flex items-center gap-2 mb-5">
          <span class="text-lg">🔍</span>
          <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Filtres de recherche</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">

          <!-- Active company -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dossier actif</label>
            <div class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 truncate">
              {{ (companyName$ | async) ?? 'Aucun dossier' }}
            </div>
          </div>

          <!-- Account selector -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Compte OHADA</label>
            <select [(ngModel)]="selectedCompteId"
                    class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
              <option value="" disabled>-- Sélectionner un compte --</option>
              @for (compte of accounts(); track compte.id) {
                <option [value]="compte.id">{{ compte.numero }} — {{ compte.intitule }}</option>
              }
            </select>
          </div>

          <!-- Date début -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date de début</label>
            <input type="date" [(ngModel)]="dateDebut"
                   class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
          </div>

          <!-- Date fin -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date de fin</label>
            <input type="date" [(ngModel)]="dateFin"
                   class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
          </div>

          <!-- Button -->
          <div>
            <app-button (clicked)="loadLedger()" [fullWidth]="true"
                        [disabled]="isLoading || !selectedCompanyId || !selectedCompteId">
              Afficher les mouvements
            </app-button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (isLoading) {
        <div class="py-16">
          <app-spinner message="Chargement du Grand Livre..."></app-spinner>
        </div>
      }

      <!-- No data -->
      @if (!isLoading && !result) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div class="text-4xl mb-4">📋</div>
          <p class="text-slate-500 font-medium">Sélectionnez un compte et cliquez sur « Afficher les mouvements »</p>
        </div>
      }

      <!-- Result -->
      @if (!isLoading && result) {

        <!-- Account Info Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm"
                   [ngClass]="{
                     'bg-blue-50 text-blue-700': result.type === 'ACTIF',
                     'bg-purple-50 text-purple-700': result.type === 'PASSIF',
                     'bg-red-50 text-red-700': result.type === 'CHARGE',
                     'bg-emerald-50 text-emerald-700': result.type === 'PRODUIT'
                   }">
                {{ result.numeroCompte.substring(0, 1) }}
              </div>
              <div>
                <h3 class="text-xl font-bold text-slate-800">{{ result.numeroCompte }} — {{ result.intituleCompte }}</h3>
                <div class="flex items-center gap-3 mt-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-blue-100 text-blue-700': result.type === 'ACTIF',
                          'bg-purple-100 text-purple-700': result.type === 'PASSIF',
                          'bg-red-100 text-red-700': result.type === 'CHARGE',
                          'bg-emerald-100 text-emerald-700': result.type === 'PRODUIT'
                        }">
                    {{ result.type }}
                  </span>
                  <span class="text-xs text-slate-400">
                    {{ result.lignes.length }} mouvement{{ result.lignes.length > 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="flex gap-4 flex-wrap">
              <div class="bg-blue-50 rounded-xl px-5 py-3 min-w-[140px]">
                <div class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Total Débit</div>
                <div class="text-lg font-bold text-blue-800">{{ result.totalDebit | number:'1.0-0' }} <span class="text-xs font-medium">XOF</span></div>
              </div>
              <div class="bg-orange-50 rounded-xl px-5 py-3 min-w-[140px]">
                <div class="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Total Crédit</div>
                <div class="text-lg font-bold text-orange-800">{{ result.totalCredit | number:'1.0-0' }} <span class="text-xs font-medium">XOF</span></div>
              </div>
              <div class="rounded-xl px-5 py-3 min-w-[160px]"
                   [ngClass]="result.soldeFinal >= 0 ? 'bg-emerald-50' : 'bg-red-50'">
                <div class="text-xs font-bold uppercase tracking-wider mb-1"
                     [ngClass]="result.soldeFinal >= 0 ? 'text-emerald-500' : 'text-red-500'">
                  Solde Final
                </div>
                <div class="text-lg font-bold"
                     [ngClass]="result.soldeFinal >= 0 ? 'text-emerald-800' : 'text-red-800'">
                  {{ (result.soldeFinal >= 0 ? result.soldeFinal : -result.soldeFinal) | number:'1.0-0' }}
                  <span class="text-xs font-medium">XOF {{ result.soldeFinal >= 0 ? 'D' : 'C' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Movements Table -->
        @if (result.lignes.length === 0) {
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div class="text-4xl mb-4">📭</div>
            <p class="text-slate-500 font-medium">Aucun mouvement trouvé pour ce compte sur la période sélectionnée.</p>
          </div>
        } @else {
          <div class="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200/80">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80">
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Date</th>
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Journal</th>
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">N° Écriture</th>
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Libellé</th>
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-right">Débit</th>
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-right">Crédit</th>
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-right">Solde Progressif</th>
                  <th class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">Lettrage</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (ligne of result.lignes; track ligne.ligneId; let i = $index) {
                  <tr class="hover:bg-blue-50/40 transition-colors duration-150"
                      [class.bg-slate-50/50]="i % 2 === 1">
                    <td class="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap font-medium">
                      {{ formatDate(ligne.date) }}
                    </td>
                    <td class="px-5 py-3.5 text-sm">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide"
                            [ngClass]="{
                              'bg-green-100 text-green-700': ligne.journal === 'Ventes',
                              'bg-amber-100 text-amber-700': ligne.journal === 'Achats',
                              'bg-blue-100 text-blue-700': ligne.journal === 'Banque',
                              'bg-slate-100 text-slate-600': ligne.journal === 'Opérations Div.'
                            }">
                        {{ ligne.journal }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-sm text-slate-500 font-mono">{{ ligne.ecritureId }}</td>
                    <td class="px-5 py-3.5 text-sm text-slate-700 font-medium max-w-[250px] truncate">{{ ligne.libelle }}</td>
                    <td class="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                      @if (ligne.debit > 0) {
                        <span class="font-bold text-blue-700">{{ ligne.debit | number:'1.0-0' }}</span>
                      } @else {
                        <span class="text-slate-300">—</span>
                      }
                    </td>
                    <td class="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                      @if (ligne.credit > 0) {
                        <span class="font-bold text-orange-600">{{ ligne.credit | number:'1.0-0' }}</span>
                      } @else {
                        <span class="text-slate-300">—</span>
                      }
                    </td>
                    <td class="px-5 py-3.5 text-sm text-right whitespace-nowrap font-bold"
                        [ngClass]="ligne.soldeProgressif >= 0 ? 'text-emerald-700' : 'text-red-600'">
                      {{ (ligne.soldeProgressif >= 0 ? ligne.soldeProgressif : -ligne.soldeProgressif) | number:'1.0-0' }}
                      <span class="text-[10px] font-medium ml-0.5 opacity-70">{{ ligne.soldeProgressif >= 0 ? 'D' : 'C' }}</span>
                    </td>
                    <td class="px-5 py-3.5 text-center">
                      @if (ligne.lettrage) {
                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          {{ ligne.lettrage }}
                        </span>
                      } @else {
                        <span class="text-slate-300 text-xs">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
              <!-- Totals Footer -->
              <tfoot>
                <tr class="bg-slate-800 text-white">
                  <td colspan="4" class="px-5 py-4 text-sm font-bold uppercase tracking-wider">Totaux</td>
                  <td class="px-5 py-4 text-sm text-right font-bold">{{ result.totalDebit | number:'1.0-0' }}</td>
                  <td class="px-5 py-4 text-sm text-right font-bold">{{ result.totalCredit | number:'1.0-0' }}</td>
                  <td class="px-5 py-4 text-sm text-right font-bold"
                      [ngClass]="result.soldeFinal >= 0 ? 'text-emerald-300' : 'text-red-300'">
                    {{ (result.soldeFinal >= 0 ? result.soldeFinal : -result.soldeFinal) | number:'1.0-0' }}
                    {{ result.soldeFinal >= 0 ? 'D' : 'C' }}
                  </td>
                  <td class="px-5 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        }
      }
    </div>
  `
})
export class LedgerComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private tenantContext = inject(TenantContextService);
  private ledgerService = inject(LedgerService);
  private planService = inject(PlanComptableService);

  companyName$ = this.tenantContext.companyName$;
  selectedCompanyId = '';
  
  accounts = toSignal(
    this.tenantContext.companyId$.pipe(
      switchMap(id => id ? this.planService.getAccounts(id) : of([]))
    ),
    { initialValue: [] }
  );

  selectedCompteId = '';
  dateDebut = '2024-01-01';
  dateFin = new Date().toISOString().split('T')[0];

  isLoading = false;
  result: LedgerResult | null = null;

  ngOnInit() {
    this.tenantContext.companyId$.pipe(
      filter((companyId): companyId is string => !!companyId),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(companyId => {
      this.selectedCompanyId = companyId;
      this.selectedCompteId = ''; // Reset on company change
      this.result = null;
    });
  }

  loadLedger() {
    if (!this.selectedCompanyId || !this.selectedCompteId) {
      this.result = null;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.ledgerService
      .getGrandLivre(this.selectedCompanyId, this.selectedCompteId, this.dateDebut, this.dateFin)
      .pipe(
        timeout(5000),
        catchError(err => {
          console.error('Erreur lors du chargement du grand livre:', err);
          return of(null);
        }),
        finalize(() => { this.isLoading = false; }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(data => {
        this.result = data;
      });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
