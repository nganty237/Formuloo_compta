import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { LettrageService, LettrageLine } from '../../services/lettrage.service';
import { AccountService as CoreAccountService, TenantContextService } from '@core';
import { PlanComptableService } from '../../services/plan-comptable.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '@shared';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-lettrage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- En-tête -->
      <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Lettrage Comptable</h1>
          <p class="text-slate-500 text-sm mt-1">Associez vos factures clients/fournisseurs et leurs règlements correspondants</p>
        </div>
      </div>

      <!-- Sélection du Compte Tiers et du Mode -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-end justify-between">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="form-group">
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Compte de tiers</label>
            <select 
              [formControl]="compteControl"
              class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer w-72">
              <option value="" disabled>-- Sélectionner un compte --</option>
              @for (cpt of accounts(); track cpt.id) {
                <option [value]="cpt.id">{{ cpt.numero }} - {{ cpt.intitule }}</option>
              }
            </select>
          </div>

          <div class="flex border-b border-slate-200 pb-0.5">
            <button 
              (click)="activeTab.set('UNLETTERED')"
              [class]="activeTab() === 'UNLETTERED' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500 font-medium'"
              class="px-4 py-2 text-sm transition-all cursor-pointer">
              Écritures non lettrées
            </button>
            <button 
              (click)="activeTab.set('LETTERED')"
              [class]="activeTab() === 'LETTERED' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500 font-medium'"
              class="px-4 py-2 text-sm transition-all cursor-pointer">
              Historique Lettré
            </button>
          </div>
        </div>

        @if (activeTab() === 'UNLETTERED' && selectedLines().length > 0) {
          <!-- Barre d'outils de lettrage -->
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap gap-4 items-center">
            <div class="text-sm">
              <span class="text-slate-500">Sélection : </span>
              <span class="font-bold text-slate-800">{{ selectedLines().length }} ligne(s)</span>
            </div>
            
            <div class="text-sm border-l border-slate-200 pl-4">
              <span class="text-slate-500">Écart : </span>
              <span class="font-black" [class.text-emerald-600]="isBalanced()" [class.text-red-500]="!isBalanced()">
                {{ runningBalance() | number:'1.0-0' }} XOF
              </span>
            </div>

            <button 
              (click)="performLettrage()"
              [disabled]="!isBalanced()"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer">
              Valider le Lettrage
            </button>
          </div>
        }
      </div>

      <!-- Zone de Notification -->
      @if (notificationMessage()) {
        <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
          <span class="text-emerald-800 text-sm font-semibold">{{ notificationMessage() }}</span>
          <button (click)="notificationMessage.set('')" class="text-emerald-500 hover:text-emerald-700">
            <app-icon name="x" size="sm"></app-icon>
          </button>
        </div>
      }

      @if (activeTab() === 'UNLETTERED') {
        <!-- Liste Non Lettrée -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th class="p-4 w-12 text-center">
                  <input type="checkbox" (change)="toggleAllLines($event)" [checked]="isAllSelected()" class="cursor-pointer">
                </th>
                <th class="p-4 w-28">Date</th>
                <th class="p-4 w-24">Journal</th>
                <th class="p-4">Libellé de l'écriture</th>
                <th class="p-4 text-right w-32">Débit</th>
                <th class="p-4 text-right w-32">Crédit</th>
              </tr>
            </thead>
            <tbody>
              @for (line of unletteredLines(); track line.id) {
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors" [class.bg-blue-50]="isLineSelected(line.id)">
                  <td class="p-4 text-center">
                    <input type="checkbox" (change)="toggleLine(line.id)" [checked]="isLineSelected(line.id)" class="cursor-pointer">
                  </td>
                  <td class="p-4 text-slate-600 text-sm font-medium">{{ line.entryDate | date:'dd/MM/yyyy' }}</td>
                  <td class="p-4">
                    <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                      {{ line.journalId }}
                    </span>
                  </td>
                  <td class="p-4 text-slate-800 font-semibold text-sm">{{ line.entryLibelle }}</td>
                  <td class="p-4 text-right font-bold text-slate-700">{{ line.debit > 0 ? (line.debit | number:'1.0-0') : '' }}</td>
                  <td class="p-4 text-right font-bold text-slate-700">{{ line.credit > 0 ? (line.credit | number:'1.0-0') : '' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-12 text-center text-slate-400">
                    <app-icon name="check-circle" size="xl" className="mx-auto mb-3 opacity-20"></app-icon>
                    <p>Toutes les écritures de ce compte sont lettrées.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <!-- Liste Lettrée (Historique) -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th class="p-4 w-20 text-center">Code</th>
                <th class="p-4 w-28">Date</th>
                <th class="p-4">Libellé</th>
                <th class="p-4 text-right w-32">Débit</th>
                <th class="p-4 text-right w-32">Crédit</th>
                <th class="p-4 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (line of letteredLines(); track line.id) {
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="p-4 text-center">
                    <span class="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-black">
                      {{ line.lettrage }}
                    </span>
                  </td>
                  <td class="p-4 text-slate-600 text-sm">{{ line.entryDate | date:'dd/MM/yyyy' }}</td>
                  <td class="p-4 text-slate-800 font-medium text-sm">{{ line.entryLibelle }}</td>
                  <td class="p-4 text-right font-bold text-slate-700">{{ line.debit > 0 ? (line.debit | number:'1.0-0') : '' }}</td>
                  <td class="p-4 text-right font-bold text-slate-700">{{ line.credit > 0 ? (line.credit | number:'1.0-0') : '' }}</td>
                  <td class="p-4 text-center">
                    <button (click)="delettrer(line.lettrage!)" title="Supprimer le lettrage" class="text-red-400 hover:text-red-600 transition-colors">
                      <app-icon name="trash-2" size="sm"></app-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-12 text-center text-slate-400">Aucun historique de lettrage pour ce compte.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class LettrageComponent implements OnInit {
  private lettrageService = inject(LettrageService);
  private planService = inject(PlanComptableService);
  private tenantContext = inject(TenantContextService);
  private fb = inject(FormBuilder);

  companyId = toSignal(this.tenantContext.companyId$);
  
  // États UI
  activeTab = signal<'UNLETTERED' | 'LETTERED'>('UNLETTERED');
  selectedLines = signal<string[]>([]);
  notificationMessage = signal<string>('');

  // Filtres
  compteControl = this.fb.control('');
  selectedCompteId = toSignal(this.compteControl.valueChanges, { initialValue: '' });

  // Listes de données
  accounts = toSignal(
    this.tenantContext.companyId$.pipe(
      switchMap(id => {
        if (!id) return of([]);
        return this.planService.getAccounts(id);
      }),
      switchMap(accs => {
        // Filtrer seulement les comptes de tiers (411 Clients, 401 Fournisseurs)
        return of(accs.filter(a => a.numero.startsWith('411') || a.numero.startsWith('401')));
      })
    ),
    { initialValue: [] }
  );

  unletteredLines = signal<LettrageLine[]>([]);
  letteredLines = signal<LettrageLine[]>([]);

  // Calculs pour le lettrage
  runningBalance = computed(() => {
    const lines = this.unletteredLines().filter(l => this.selectedLines().includes(l.id));
    const debit = lines.reduce((sum, l) => sum + l.debit, 0);
    const credit = lines.reduce((sum, l) => sum + l.credit, 0);
    return debit - credit;
  });

  isBalanced = computed(() => {
    const bal = this.runningBalance();
    return this.selectedLines().length >= 2 && Math.abs(bal) < 0.01;
  });

  constructor() {
    // Recharger les données quand le compte ou le tab change
    effect(() => {
      this.refreshData();
    });

    // Sélectionner le premier compte par défaut si disponible
    effect(() => {
      const accs = this.accounts();
      if (accs.length > 0 && !this.compteControl.value) {
        this.compteControl.setValue(accs[0].id);
      }
    });
  }

  ngOnInit() {
  }

  refreshData() {
    const companyId = this.companyId();
    const compteId = this.selectedCompteId();
    
    if (!companyId || !compteId) return;

    this.lettrageService.getUnletteredLines(companyId, compteId).subscribe(lines => {
      this.unletteredLines.set(lines);
    });

    this.lettrageService.getLetteredLines(companyId, compteId).subscribe(lines => {
      this.letteredLines.set(lines);
    });

    // Reset sélection
    this.selectedLines.set([]);
  }

  isLineSelected(id: string): boolean {
    return this.selectedLines().includes(id);
  }

  toggleLine(id: string) {
    this.selectedLines.update(ids => 
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  isAllSelected(): boolean {
    const current = this.unletteredLines();
    return current.length > 0 && this.selectedLines().length === current.length;
  }

  toggleAllLines(event: any) {
    if (event.target.checked) {
      this.selectedLines.set(this.unletteredLines().map(l => l.id));
    } else {
      this.selectedLines.set([]);
    }
  }

  performLettrage() {
    const companyId = this.companyId();
    if (!companyId || !this.isBalanced()) return;

    const code = this.lettrageService.generateNextCode(companyId);
    this.lettrageService.lettrer(this.selectedLines(), code).subscribe(() => {
      this.notificationMessage.set(`Lettrage validé avec le code : ${code}`);
      this.refreshData();
      setTimeout(() => this.notificationMessage.set(''), 5000);
    });
  }

  delettrer(code: string) {
    const companyId = this.companyId();
    if (!companyId) return;

    this.lettrageService.delettrer(companyId, code).subscribe(() => {
      this.notificationMessage.set(`Lettrage ${code} annulé.`);
      this.refreshData();
      setTimeout(() => this.notificationMessage.set(''), 5000);
    });
  }
}
