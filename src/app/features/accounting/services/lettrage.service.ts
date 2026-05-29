import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { JournalService } from './journal.service';
import { LigneEcriture } from '../../../core/models/ligne-ecriture.model';

export interface LettrageLine extends LigneEcriture {
  entryDate: string;
  entryLibelle: string;
  journalId: string;
}

@Injectable({
  providedIn: 'root'
})
export class LettrageService {
  private journalService = inject(JournalService);

  /**
   * Récupère toutes les lignes d'écritures non lettrées pour un compte de tiers (ex: 411, 401)
   */
  getUnletteredLines(entrepriseId: string, compteId: string): Observable<LettrageLine[]> {
    const unlettered: LettrageLine[] = [];
    
    // Parcourir toutes les écritures de l'entreprise
    this.journalService.entries
      .filter(e => e.entrepriseId === entrepriseId)
      .forEach(entry => {
        entry.lignes.forEach(line => {
          // Filtrer par compte comptable exact ou par racine (ex: 411 ou 411000) et s'assurer qu'il n'est pas déjà lettré
          if ((line.compteId === compteId || line.compteId.startsWith(compteId)) && !line.lettrage) {
            unlettered.push({
              ...line,
              entryDate: entry.date,
              entryLibelle: entry.libelle,
              journalId: entry.journalId
            });
          }
        });
      });

    // Trier par date
    unlettered.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    return of(unlettered);
  }

  /**
   * Applique un code de lettrage à un lot d'identifiants de lignes d'écritures
   */
  lettrer(lineIds: string[], code: string): Observable<boolean> {
    this.journalService.entries.forEach(entry => {
      entry.lignes.forEach(line => {
        if (lineIds.includes(line.id)) {
          line.lettrage = code;
        }
      });
    });
    return of(true);
  }

  /**
   * Supprime le lettrage pour un code donné
   */
  delettrer(entrepriseId: string, code: string): Observable<boolean> {
    this.journalService.entries
      .filter(e => e.entrepriseId === entrepriseId)
      .forEach(entry => {
        entry.lignes.forEach(line => {
          if (line.lettrage === code) {
            delete line.lettrage;
          }
        });
      });
    return of(true);
  }

  /**
   * Génère automatiquement la prochaine lettre de lettrage (A, B, C ... Z, AA, AB ...)
   */
  generateNextCode(entrepriseId: string): string {
    const codes = new Set<string>();
    
    this.journalService.entries
      .filter(e => e.entrepriseId === entrepriseId)
      .forEach(entry => {
        entry.lignes.forEach(line => {
          if (line.lettrage) {
            codes.add(line.lettrage);
          }
        });
      });

    let charCode = 65; // 'A'
    let prefix = '';
    
    while (true) {
      const code = prefix + String.fromCharCode(charCode);
      if (!codes.has(code)) {
        return code;
      }
      
      charCode++;
      if (charCode > 90) { // Dépassé 'Z'
        charCode = 65;
        prefix = prefix ? String.fromCharCode(prefix.charCodeAt(0) + 1) : 'A';
      }
    }
  }

  /**
   * Obtenir toutes les lignes déjà lettrées pour un compte de tiers
   */
  getLetteredLines(entrepriseId: string, compteId: string): Observable<LettrageLine[]> {
    const lettered: LettrageLine[] = [];
    
    this.journalService.entries
      .filter(e => e.entrepriseId === entrepriseId)
      .forEach(entry => {
        entry.lignes.forEach(line => {
          if ((line.compteId === compteId || line.compteId.startsWith(compteId)) && line.lettrage) {
            lettered.push({
              ...line,
              entryDate: entry.date,
              entryLibelle: entry.libelle,
              journalId: entry.journalId
            });
          }
        });
      });

    return of(lettered);
  }
}
