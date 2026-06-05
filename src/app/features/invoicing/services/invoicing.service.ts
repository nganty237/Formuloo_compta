import { Facture, Ecriture } from '@core';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
;
import { EntryService } from '../../accounting/services/entry.service';
;
import {  environment  } from '@env/environment';
@Injectable({
  providedIn: 'root'
})
export class InvoicingService {
  private http = inject(HttpClient);
  private entryService = inject(EntryService);
  private apiUrl = `${environment.apiUrl}/factures`;
  getFactures(entrepriseId: string): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}?entrepriseId=${entrepriseId}`);
  }
  getById(id: string): Observable<Facture | undefined> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`);
  }
  create(facture: Omit<Facture, 'id'>): Observable<Facture> {
    const newFacture: Partial<Facture> = {
      ...facture,
      id: `FAC-${Date.now()}`
    };
    return this.http.post<Facture>(this.apiUrl, newFacture).pipe(
      switchMap(savedFacture => {
        // Si c'est une facture déjà validée, on comptabilise
        if (savedFacture.type !== 'DEVIS' && savedFacture.statut !== 'BROUILLON') {
            return this.comptabiliser(savedFacture).pipe(map(() => savedFacture));
        }
        return of(savedFacture);
      })
    );
  }
  update(id: string, facture: Partial<Facture>): Observable<Facture> {
    return this.http.patch<Facture>(`${this.apiUrl}/${id}`, facture).pipe(
      switchMap(updated => {
        // Logique de comptabilisation simplifiée pour le prototype
        if (updated.statut === 'ENVOYEE' && updated.type !== 'DEVIS') {
            return this.comptabiliser(updated).pipe(map(() => updated));
        }
        return of(updated);
      })
    );
  }
  delete(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(map(() => true));
  }
  convertToFacture(devisId: string): Observable<Facture> {
    return this.getById(devisId).pipe(
        switchMap(devis => {
            if (!devis) throw new Error('Devis not found');
            const facture: Omit<Facture, 'id'> = {
                ...devis,
                type: 'FACTURE',
                numero: devis.numero.replace('DEV', 'FAC'),
                date: new Date().toISOString().split('T')[0],
                statut: 'ENVOYEE'
            };
            return this.create(facture);
        })
    );
  }
  sendEmail(id: string): Observable<boolean> {
    return of(true);
  }
  private comptabiliser(f: Facture): Observable<Ecriture> {
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
    return this.entryService.create(ecriture);
  }
}
