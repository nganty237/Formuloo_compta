import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Facture } from '../../../core/models/facture.model';
import { MockDataService } from '../../../core/services/mock-data.service';
import { EntryService } from '../../accounting/services/entry.service';
import { Ecriture } from '../../../core/models/ecriture.model';

@Injectable({
  providedIn: 'root'
})
export class InvoicingService {
  private entryService = inject(EntryService);
  private mockData = inject(MockDataService);

  getFactures(entrepriseId: string): Observable<Facture[]> {
    const data = this.mockData.factures.filter(f => f.entrepriseId === entrepriseId);
    return of(data).pipe(delay(500));
  }

  getById(id: string): Observable<Facture | undefined> {
    const facture = this.mockData.factures.find(f => f.id === id);
    return of(facture).pipe(delay(300));
  }

  create(facture: Omit<Facture, 'id'>): Observable<Facture> {
    const newFacture: Facture = {
      ...facture,
      id: `FAC-${Date.now()}`
    };
    this.mockData.factures.push(newFacture);

    // Si c'est une facture déjà validée, on comptabilise
    if (newFacture.type !== 'DEVIS' && newFacture.statut !== 'BROUILLON') {
        this.comptabiliser(newFacture);
    }

    return of(newFacture).pipe(delay(500));
  }

  update(id: string, facture: Partial<Facture>): Observable<Facture> {
    const idx = this.mockData.factures.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Facture not found');

    const old = this.mockData.factures[idx];
    this.mockData.factures[idx] = { ...old, ...facture };
    const updated = this.mockData.factures[idx];
    
    // Si on passe de BROUILLON à ENVOYEE, on comptabilise
    if (old.statut === 'BROUILLON' && updated.statut === 'ENVOYEE' && updated.type !== 'DEVIS') {
        this.comptabiliser(updated);
    }

    return of(updated).pipe(delay(500));
  }

  delete(id: string): Observable<boolean> {
    const idx = this.mockData.factures.findIndex(f => f.id === id);
    if (idx !== -1) {
        this.mockData.factures.splice(idx, 1);
        return of(true).pipe(delay(300));
    }
    return of(false);
  }

  convertToFacture(devisId: string): Observable<Facture> {
    const devis = this.mockData.factures.find(f => f.id === devisId && f.type === 'DEVIS');
    if (!devis) throw new Error('Devis not found');
    
    const facture: Facture = {
        ...devis,
        id: `FAC-${Date.now()}`,
        type: 'FACTURE',
        numero: devis.numero.replace('DEV', 'FAC'),
        date: new Date().toISOString().split('T')[0],
        statut: 'ENVOYEE'
    };
    this.mockData.factures.push(facture);
    this.comptabiliser(facture);
    return of(facture).pipe(delay(500));
  }

  sendEmail(id: string): Observable<boolean> {
    console.log(`Simulation d'envoi d'email pour la facture ${id}`);
    return of(true).pipe(delay(1000));
  }

  private comptabiliser(f: Facture) {
    const isAvoir = f.type === 'AVOIR';
    
    const ecriture: Ecriture = {
        id: `INV-ENT-${f.id}`,
        entrepriseId: f.entrepriseId,
        journalId: 'VTE',
        date: f.date,
        libelle: `${f.type} N° ${f.numero}`,
        valide: true,
        lignes: [
            // Compte Client (411)
            {
                id: `l-${f.id}-1`,
                ecritureId: `INV-ENT-${f.id}`,
                compteId: 'cpt-411',
                debit: isAvoir ? 0 : f.montantTtc,
                credit: isAvoir ? f.montantTtc : 0
            },
            // Compte de Ventes (70x)
            {
                id: `l-${f.id}-2`,
                ecritureId: `INV-ENT-${f.id}`,
                compteId: f.compteProduitId || 'cpt-706',
                debit: isAvoir ? f.montantHt : 0,
                credit: isAvoir ? 0 : f.montantHt
            },
            // TVA Collectée (443)
            {
                id: `l-${f.id}-3`,
                ecritureId: `INV-ENT-${f.id}`,
                compteId: 'cpt-443',
                debit: isAvoir ? f.tva : 0,
                credit: isAvoir ? 0 : f.tva
            }
        ]
    };

    this.entryService.create(ecriture).subscribe();
  }
}
