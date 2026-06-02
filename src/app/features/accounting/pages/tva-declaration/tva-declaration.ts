import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {  TenantContextService  } from '@core';
import { InvoicingService } from '../../../invoicing/services/invoicing.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {  IconComponent  } from '@shared';
import { switchMap, of } from 'rxjs';

interface AchatMock {
  id: string;
  entrepriseId: string;
  fournisseur: string;
  date: string;
  montantHt: number;
  tva: number;
  montantTtc: number;
}

@Component({
  selector: 'app-tva-declaration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- En-tête -->
      <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Déclaration de TVA</h1>
          <p class="text-slate-500 text-sm mt-1">Générez et consultez vos déclarations périodiques de TVA pour {{ companyName() }}</p>
        </div>
      </div>

      <!-- Filtres Périodiques -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div class="form-group">
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Périodicité</label>
          <select 
            [formControl]="periodTypeControl"
            class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer w-44">
            <option value="MONTHLY">Mensuelle</option>
            <option value="QUARTERLY">Trimestrielle</option>
          </select>
        </div>

        @if (periodTypeControl.value === 'MONTHLY') {
          <div class="form-group">
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Mois</label>
            <select 
              [formControl]="monthControl"
              class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer w-44">
              <option value="01">Janvier</option>
              <option value="02">Février</option>
              <option value="03">Mars</option>
              <option value="04">Avril</option>
              <option value="05">Mai</option>
              <option value="06">Juin</option>
              <option value="07">Juillet</option>
              <option value="08">Août</option>
              <option value="09">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
          </div>
        } @else {
          <div class="form-group">
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Trimestre</label>
            <select 
              [formControl]="quarterControl"
              class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer w-44">
              <option value="Q1">1er Trimestre (Jan-Mar)</option>
              <option value="Q2">2e Trimestre (Avr-Jun)</option>
              <option value="Q3">3e Trimestre (Jul-Sep)</option>
              <option value="Q4">4e Trimestre (Oct-Déc)</option>
            </select>
          </div>
        }

        <div class="form-group">
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Année</label>
          <select 
            [formControl]="yearControl"
            class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm bg-white cursor-pointer w-32">
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      <!-- Indicateurs de Synthèse (KPIs) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- TVA Collectée -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-slate-500 text-sm font-medium">TVA Collectée (Ventes)</p>
            <p class="text-2xl font-black text-slate-800">{{ summary().collectee | number:'1.0-0' }} XOF</p>
            <p class="text-xs text-slate-400">Sur {{ summary().nbVentes }} vente(s) facturée(s)</p>
          </div>
          <div class="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <app-icon name="arrow-up-right" size="lg"></app-icon>
          </div>
        </div>

        <!-- TVA Déductible -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-slate-500 text-sm font-medium">TVA Déductible (Achats)</p>
            <p class="text-2xl font-black text-slate-800">{{ summary().deductible | number:'1.0-0' }} XOF</p>
            <p class="text-xs text-slate-400">Sur {{ summary().nbAchats }} achat(s) enregistré(s)</p>
          </div>
          <div class="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <app-icon name="arrow-down-left" size="lg"></app-icon>
          </div>
        </div>

        <!-- Solde Net de TVA -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
             [class.border-emerald-200]="summary().solde < 0"
             [class.border-red-200]="summary().solde > 0">
          <div class="space-y-1">
            <p class="text-slate-500 text-sm font-medium">État du Solde TVA</p>
            <p class="text-2xl font-black" [class.text-red-600]="summary().solde > 0" [class.text-emerald-600]="summary().solde <= 0">
              {{ abs(summary().solde) | number:'1.0-0' }} XOF
            </p>
            <p class="text-xs font-bold" [class.text-red-500]="summary().solde > 0" [class.text-emerald-500]="summary().solde <= 0">
              {{ summary().solde > 0 ? 'TVA À DÉCAISSER ⚠' : 'CRÉDIT DE TVA DE REPORT' }}
            </p>
          </div>
          <div class="h-12 w-12 rounded-lg flex items-center justify-center"
               [class.bg-red-50]="summary().solde > 0" [class.text-red-600]="summary().solde > 0"
               [class.bg-emerald-50]="summary().solde <= 0" [class.text-emerald-600]="summary().solde <= 0">
            <app-icon [name]="summary().solde > 0 ? 'coins' : 'piggy-bank'" size="lg"></app-icon>
          </div>
        </div>
      </div>

      <!-- Fiche Fiscale / Déclaration Officielle -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold">Modèle Simplifié de Déclaration de TVA (OHADA)</h3>
            <p class="text-slate-300 text-xs">Période : {{ getPeriodLabel() }} {{ yearControl.value }}</p>
          </div>
          <span class="bg-slate-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
            {{ companyName() }}
          </span>
        </div>

        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Section Ventes -->
            <div class="space-y-4">
              <h4 class="font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase text-sm tracking-wide">1. Opérations Imposables (Ventes)</h4>
              
              <div class="flex justify-between text-sm py-1.5 border-b border-slate-100">
                <span class="text-slate-600">Base Hors Taxes (Ventes) :</span>
                <span class="font-semibold text-slate-800">{{ summary().baseVentesHt | number:'1.0-0' }} XOF</span>
              </div>
              <div class="flex justify-between text-sm py-1.5 border-b border-slate-100 font-bold">
                <span class="text-slate-800">TVA Collectée (Taux standard 18%) :</span>
                <span class="text-blue-600">{{ summary().collectee | number:'1.0-0' }} XOF</span>
              </div>
            </div>

            <!-- Section Achats -->
            <div class="space-y-4">
              <h4 class="font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase text-sm tracking-wide">2. Droits à Déduction (Achats)</h4>
              
              <div class="flex justify-between text-sm py-1.5 border-b border-slate-100">
                <span class="text-slate-600">Base Hors Taxes (Achats/Charges) :</span>
                <span class="font-semibold text-slate-800">{{ summary().baseAchatsHt | number:'1.0-0' }} XOF</span>
              </div>
              <div class="flex justify-between text-sm py-1.5 border-b border-slate-100 font-bold">
                <span class="text-slate-800">TVA Déductible (Matériels & Services) :</span>
                <span class="text-emerald-600">{{ summary().deductible | number:'1.0-0' }} XOF</span>
              </div>
            </div>
          </div>

          <!-- Section Résultat final -->
          <div class="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
            <h4 class="font-bold text-slate-800 uppercase text-xs tracking-wider">3. Calcul du Solde de la Déclaration</h4>
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">Total TVA Collectée :</span>
              <span class="font-medium text-slate-800">{{ summary().collectee | number:'1.0-0' }} XOF</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">Total TVA Déductible :</span>
              <span class="font-medium text-slate-800">- {{ summary().deductible | number:'1.0-0' }} XOF</span>
            </div>
            <div class="border-t border-slate-300 my-2"></div>
            
            @if (summary().solde > 0) {
              <div class="flex justify-between items-center text-red-700 font-bold">
                <span class="text-base">TVA NETTE À PAYER (À décaisser) :</span>
                <span class="text-2xl">{{ summary().solde | number:'1.0-0' }} XOF</span>
              </div>
            } @else {
              <div class="flex justify-between items-center text-emerald-700 font-bold">
                <span class="text-base">EXCÉDENT / CRÉDIT DE TVA À REPORTER :</span>
                <span class="text-2xl">{{ abs(summary().solde) | number:'1.0-0' }} XOF</span>
              </div>
            }
          </div>
        </div>
      </div>

    </div>
  `
})
export class TvaDeclarationComponent {
  private tenantContext = inject(TenantContextService);
  private invoicingService = inject(InvoicingService);
  private fb = inject(FormBuilder);

  companyId = toSignal(this.tenantContext.companyId$);
  companyName = toSignal(this.tenantContext.companyName$);

  // Form Controls
  periodTypeControl = this.fb.control<'MONTHLY' | 'QUARTERLY'>('MONTHLY', { nonNullable: true });
  monthControl = this.fb.control<string>('10', { nonNullable: true }); // Octobre par défaut
  quarterControl = this.fb.control<string>('Q4', { nonNullable: true });
  yearControl = this.fb.control<string>('2023', { nonNullable: true });

  // Mocks pour les achats (pour calculer la TVA déductible de manière réaliste)
  private achatsMockList: AchatMock[] = [
    { id: 'ach-1', entrepriseId: 'tenant-1', fournisseur: 'Senelec', date: '2023-10-05', montantHt: 200000, tva: 36000, montantTtc: 236000 },
    { id: 'ach-2', entrepriseId: 'tenant-1', fournisseur: 'Orange Business', date: '2023-10-20', montantHt: 300000, tva: 54000, montantTtc: 354000 },
    { id: 'ach-3', entrepriseId: 'tenant-1', fournisseur: 'Fournisseur Matériel', date: '2023-11-10', montantHt: 500000, tva: 90000, montantTtc: 590000 },
    { id: 'ach-4', entrepriseId: 'c-002', fournisseur: 'Fournisseur Farine', date: '2023-11-05', montantHt: 150000, tva: 27000, montantTtc: 177000 }
  ];

  // Signaux réactifs pour les valeurs des formulaires
  periodType = toSignal(this.periodTypeControl.valueChanges, { initialValue: 'MONTHLY' as const });
  selectedMonth = toSignal(this.monthControl.valueChanges, { initialValue: '10' });
  selectedQuarter = toSignal(this.quarterControl.valueChanges, { initialValue: 'Q4' });
  selectedYear = toSignal(this.yearControl.valueChanges, { initialValue: '2023' });

  // Récupération des factures via InvoicingService
  private factures = toSignal(
    this.tenantContext.companyId$.pipe(
      switchMap((id: string | null) => id ? this.invoicingService.getFactures(id) : of([]))
    ),
    { initialValue: [] }
  );

  // Calcul du récapitulatif
  summary = computed(() => {
    const activeCompanyId = this.companyId() || 'tenant-1';
    const isMonthly = this.periodType() === 'MONTHLY';
    const m = this.selectedMonth() || '10';
    const q = this.selectedQuarter() || 'Q4';
    const y = this.selectedYear() || '2023';

    // Filtre des ventes (factures de statut différent de BROUILLON/ANNULEE)
    let filteredSales = this.factures().filter((f: any) => f.statut !== 'ANNULEE' && f.statut !== 'BROUILLON' && f.type === 'FACTURE');
    // Filtre des achats
    let filteredPurchases = this.achatsMockList.filter((p: AchatMock) => p.entrepriseId === activeCompanyId);

    // Filtres temporels
    if (isMonthly) {
      const matchPattern = `${y}-${m}`;
      filteredSales = filteredSales.filter((f: any) => f.date.startsWith(matchPattern));
      filteredPurchases = filteredPurchases.filter((p: AchatMock) => p.date.startsWith(matchPattern));
    } else {
      // Filtrer par trimestre
      const months = q === 'Q1' ? ['01', '02', '03'] :
                     q === 'Q2' ? ['04', '05', '06'] :
                     q === 'Q3' ? ['07', '08', '09'] : ['10', '11', '12'];

      filteredSales = filteredSales.filter((f: any) => {
        const parts = f.date.split('-');
        return parts[0] === y && months.includes(parts[1]);
      });
      filteredPurchases = filteredPurchases.filter((p: AchatMock) => {
        const parts = p.date.split('-');
        return parts[0] === y && months.includes(parts[1]);
      });
    }

    // Totaux Ventes
    const baseVentesHt = filteredSales.reduce((sum: number, f: any) => sum + f.montantHt, 0);
    const collectee = filteredSales.reduce((sum: number, f: any) => sum + f.tva, 0);

    // Totaux Achats
    const baseAchatsHt = filteredPurchases.reduce((sum: number, p: AchatMock) => sum + p.montantHt, 0);
    const deductible = filteredPurchases.reduce((sum: number, p: AchatMock) => sum + p.tva, 0);

    const solde = collectee - deductible;

    return {
      baseVentesHt,
      collectee,
      nbVentes: filteredSales.length,
      baseAchatsHt,
      deductible,
      nbAchats: filteredPurchases.length,
      solde
    };
  });

  abs(value: number): number {
    return Math.abs(value);
  }

  getPeriodLabel(): string {
    if (this.periodType() === 'MONTHLY') {
      const monthsLabels: Record<string, string> = {
        '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
        '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
        '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
      };
      return monthsLabels[this.selectedMonth() || '10'] || '';
    } else {
      const quartersLabels: Record<string, string> = {
        'Q1': '1er Trimestre (Janvier - Mars)',
        'Q2': '2e Trimestre (Avril - Juin)',
        'Q3': '3e Trimestre (Juillet - Septembre)',
        'Q4': '4e Trimestre (Octobre - Décembre)'
      };
      return quartersLabels[this.selectedQuarter() || 'Q4'] || '';
    }
  }
}
