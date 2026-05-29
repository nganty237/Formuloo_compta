import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Facture } from '../../../../core/models/facture.model';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { InvoicingService } from '../../services/invoicing.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Facturation</h1>
          <p class="text-slate-500 text-sm mt-1">Gérez les devis, factures et avoirs de {{ companyName() }}</p>
        </div>
        @if (currentUser()?.role !== 'CLIENT') {
          <a routerLink="../new" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
            <app-icon name="plus"></app-icon>
            <span>Nouveau Document</span>
          </a>
        }
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <th class="p-4">Type</th>
              <th class="p-4">Numéro</th>
              <th class="p-4">Date</th>
              <th class="p-4 text-right">Montant TTC</th>
              <th class="p-4 text-center">Statut</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (facture of factures(); track facture.id) {
              <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="p-4">
                  <span class="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
                    {{ facture.type }}
                  </span>
                </td>
                <td class="p-4 font-medium text-slate-800">{{ facture.numero }}</td>
                <td class="p-4 text-slate-600">{{ facture.date | date:'dd/MM/yyyy' }}</td>
                <td class="p-4 font-bold text-slate-800 text-right">{{ facture.montantTtc | number:'1.0-0' }} XOF</td>
                <td class="p-4 text-center">
                  <span [class]="getBadgeClass(facture.statut)" class="px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    {{ facture.statut }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <a [routerLink]="['../', facture.id]" class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                    <app-icon name="eye" size="sm"></app-icon>
                    Détails
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-8 text-center text-slate-500">
                  <div class="flex flex-col items-center gap-3">
                    <app-icon name="file-text" className="text-slate-300 w-12 h-12"></app-icon>
                    <p>Aucun document trouvé pour cette entreprise.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InvoiceListComponent {
  private tenantContext = inject(TenantContextService);
  private authService = inject(AuthService);
  private invoicingService = inject(InvoicingService);

  companyName = toSignal(this.tenantContext.companyName$);
  currentUser = toSignal(this.authService.currentUser$);

  factures = toSignal(
    this.tenantContext.companyId$.pipe(
      switchMap(companyId => {
        if (!companyId) return of([]);
        return this.invoicingService.getFactures(companyId);
      })
    ),
    { initialValue: [] as Facture[] }
  );

  getBadgeClass(statut: Facture['statut']): string {
    switch (statut) {
      case 'BROUILLON': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'ENVOYEE': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'PAYEE': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'ANNULEE': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  }
}
