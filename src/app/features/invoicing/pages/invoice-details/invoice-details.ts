import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Facture } from '../../../../core/models/facture.model';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { InvoicingService } from '../../services/invoicing.service';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, ButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- Barre d'outils haut -->
      <div class="flex items-center justify-between">
        <a routerLink="../list" class="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <app-icon name="arrow-left"></app-icon> Retour à la liste
        </a>

        @if (currentUser()?.role !== 'CLIENT') {
          <div class="flex gap-3">
            @if (facture()?.type === 'DEVIS' && facture()?.statut !== 'ANNULEE') {
              <app-button (clicked)="convertToFacture()" customClass="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
                <app-icon name="arrow-right-left"></app-icon> Convertir en Facture
              </app-button>
            }
            @if (facture()?.statut === 'BROUILLON') {
              <app-button (clicked)="changeStatus('ENVOYEE')" customClass="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
                <app-icon name="send"></app-icon> Envoyer au client
              </app-button>
            }
            @if (facture()?.statut === 'ENVOYEE' && facture()?.type === 'FACTURE') {
              <app-button (clicked)="changeStatus('PAYEE')" customClass="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
                <app-icon name="check-circle"></app-icon> Marquer comme Payée
              </app-button>
            }
            @if (facture()?.statut !== 'ANNULEE' && facture()?.statut !== 'PAYEE') {
              <app-button (clicked)="changeStatus('ANNULEE')" customClass="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium">
                <app-icon name="x-circle"></app-icon> Annuler
              </app-button>
            }
            <app-button (clicked)="sendEmail()" [disabled]="isSendingEmail()" customClass="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium">
                <app-icon [name]="isSendingEmail() ? 'loader-2' : 'mail'" [className]="isSendingEmail() ? 'animate-spin' : ''"></app-icon> 
                {{ isSendingEmail() ? 'Envoi...' : 'Envoyer par Email' }}
            </app-button>
            <app-button (clicked)="print()" customClass="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium">
                <app-icon name="printer"></app-icon> Imprimer / PDF
            </app-button>
          </div>
        }
      </div>

      <!-- Zone de Notification -->
      @if (notification()) {
        <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm mb-6">
          <div class="flex items-center gap-3">
            <app-icon name="check-circle" className="text-emerald-600"></app-icon>
            <span class="text-emerald-800 text-sm font-semibold">{{ notification() }}</span>
          </div>
          <button (click)="notification.set('')" class="text-emerald-500 hover:text-emerald-700">
            <app-icon name="x" size="sm"></app-icon>
          </button>
        </div>
      }

      <!-- Corps de la facture (Style papier) -->
      @if (facture(); as inv) {
        <div id="print-area" class="bg-white p-12 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">

          <!-- En-tête de la facture -->
          <div class="flex justify-between items-start border-b border-slate-100 pb-8">
            <div>
              <h1 class="text-4xl font-black text-slate-800">{{ inv.type }}</h1>
              <p class="text-slate-500 font-medium mt-1">N° {{ inv.numero }}</p>

              <div class="mt-6 flex gap-2">
                <span [class]="getBadgeClass(inv.statut)" class="px-3 py-1 rounded-full text-xs font-bold tracking-wide border">
                  {{ inv.statut }}
                </span>
                <span class="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  {{ inv.type }}
                </span>
              </div>
            </div>

            <div class="text-right text-slate-600 text-sm space-y-1">
              <p class="font-bold text-slate-800 uppercase tracking-wide">Émetteur</p>
              <p class="text-lg">{{ companyName() }}</p>
              <p class="mt-4 font-bold text-slate-800 uppercase tracking-wide">Date d'émission</p>
              <p>{{ inv.date | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>

          <!-- Adressage client -->
          <div class="py-8 grid grid-cols-2 gap-12">
            <div class="bg-slate-50 p-6 rounded-lg border border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Destinataire</p>
              <p class="text-lg font-bold text-slate-800">Client ID : {{ inv.clientId }}</p>
              <p class="text-slate-500 text-sm mt-1">Adresse complète à implémenter<br/>Ville, Pays</p>
            </div>
          </div>

          <!-- Lignes de facture -->
          <div class="py-4">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b-2 border-slate-800 text-slate-800">
                  <th class="py-3 font-bold">Description</th>
                  <th class="py-3 font-bold text-center">Compte Comptable</th>
                  <th class="py-3 font-bold text-right">Montant HT</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-100">
                  <td class="py-4 text-slate-700 font-medium">{{ inv.description || 'Prestation de services généraux' }}</td>
                  <td class="py-4 text-center text-slate-500 font-mono text-sm">{{ inv.compteProduitId || '706000' }}</td>
                  <td class="py-4 text-right font-medium text-slate-800">{{ inv.montantHt | number:'1.2-2' }} XOF</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totaux -->
          <div class="flex justify-end pt-6">
            <div class="w-72 space-y-3">
              <div class="flex justify-between text-slate-600">
                <span>Total HT</span>
                <span class="font-medium">{{ inv.montantHt | number:'1.2-2' }} XOF</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>TVA ({{ (inv.tva / inv.montantHt * 100) | number:'1.0-0' }}%)</span>
                <span class="font-medium">+ {{ inv.tva | number:'1.2-2' }} XOF</span>
              </div>
              <div class="flex justify-between border-t-2 border-slate-800 pt-3">
                <span class="font-black text-slate-800 text-lg">Total TTC</span>
                <span class="font-black text-blue-600 text-xl">{{ inv.montantTtc | number:'1.2-2' }} XOF</span>
              </div>
            </div>
          </div>

          <!-- Watermark pour annulée -->
          @if (inv.statut === 'ANNULEE') {
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
              <span class="text-9xl font-black text-red-600 transform -rotate-45">ANNULÉE</span>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white p-12 text-center rounded-xl border border-slate-200">
          <p class="text-slate-500">Document introuvable.</p>
        </div>
      }
    </div>
  `
})
export class InvoiceDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tenantContext = inject(TenantContextService);
  private authService = inject(AuthService);
  private invoicingService = inject(InvoicingService);

  companyName = toSignal(this.tenantContext.companyName$);
  currentUser = toSignal(this.authService.currentUser$);
  facture = signal<Facture | null>(null);
  notification = signal<string>('');
  isSendingEmail = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoicingService.getById(id).subscribe(found => {
        if (found) {
          this.facture.set(found);
        }
      });
    }
  }

  changeStatus(newStatus: Facture['statut']) {
    const current = this.facture();
    if (current) {
      this.invoicingService.update(current.id, { statut: newStatus }).subscribe(updated => {
        this.facture.set(updated);
        this.showNotification(`Statut mis à jour : ${newStatus}`);
      });
    }
  }

  convertToFacture() {
    const current = this.facture();
    if (current && current.type === 'DEVIS') {
        this.invoicingService.convertToFacture(current.id).subscribe(newFacture => {
            this.showNotification('Devis converti en facture avec succès !');
            setTimeout(() => {
                this.router.navigate(['../', newFacture.id], { relativeTo: this.route });
            }, 1500);
        });
    }
  }

  sendEmail() {
    const current = this.facture();
    if (current) {
        this.isSendingEmail.set(true);
        this.invoicingService.sendEmail(current.id).subscribe(() => {
            this.isSendingEmail.set(false);
            this.showNotification('Email envoyé avec succès au client.');
        });
    }
  }

  private showNotification(message: string) {
    this.notification.set(message);
    setTimeout(() => this.notification.set(''), 5000);
  }

  print() {
    window.print();
  }

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
