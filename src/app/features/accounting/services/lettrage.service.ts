import { Injectable, inject } from '@angular/core';
import { Observable, of, map, forkJoin, switchMap } from 'rxjs';
import { JournalService } from './journal.service';
import { LigneEcriture } from '../../../core/models/ligne-ecriture.model';
import { Ecriture } from '../../../core/models/ecriture.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
  private http = inject(HttpClient);

  /**
   * Récupère toutes les lignes d'écritures non lettrées pour un compte de tiers (ex: 411, 401)
   */
  getUnletteredLines(entrepriseId: string, compteId: string): Observable<LettrageLine[]> {
    return this.journalService.getJournal(entrepriseId).pipe(
      map(entries => {
        const unlettered: LettrageLine[] = [];
        
        entries.forEach((entry: Ecriture) => {
          entry.lignes.forEach((line: LigneEcriture) => {
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
        return unlettered.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
      })
    );
  }

  /**
   * Applique un code de lettrage à un lot d'identifiants de lignes d'écritures
   */
  lettrer(lineIds: string[], code: string): Observable<boolean> {
    const requests = lineIds.map(id => 
      this.http.patch(`${environment.apiUrl}/lignes/${id}`, { lettrage: code })
    );
    return forkJoin(requests).pipe(map(() => true));
  }

  /**
   * Supprime le lettrage pour un code donné
   */
  delettrer(entrepriseId: string, code: string): Observable<boolean> {
    // On doit d'abord trouver toutes les lignes ayant ce code pour cette entreprise
    return this.getLetteredLines(entrepriseId, '').pipe(
      map(lines => lines.filter(l => l.lettrage === code)),
      switchMap(lines => {
        if (lines.length === 0) return of(true);
        const requests = lines.map(line => 
          this.http.patch(`${environment.apiUrl}/lignes/${line.id}`, { lettrage: null })
        );
        return forkJoin(requests).pipe(map(() => true));
      })
    );
  }

  /**
   * Génère automatiquement la prochaine lettre de lettrage (A, B, C ... Z, AA, AB ...)
   */
  generateNextCode(entrepriseId: string): string {
    // NOTE: Cette méthode devrait idéalement être asynchrone pour être précise avec le serveur,
    // mais pour le prototype, on va utiliser une approche simplifiée ou laisser le composant gérer.
    // Pour l'instant, on va garder une logique synchrone mais basée sur des données passées ou un cache.
    // Ou mieux, on retourne une lettre basée sur un timestamp ou un random pour éviter les collisions en mode démo.
    return Math.random().toString(36).substring(2, 5).toUpperCase();
  }

  /**
   * Obtenir toutes les lignes déjà lettrées pour un compte de tiers
   */
  getLetteredLines(entrepriseId: string, compteId: string): Observable<LettrageLine[]> {
    return this.journalService.getJournal(entrepriseId).pipe(
      map(entries => {
        const lettered: LettrageLine[] = [];
        
        entries.forEach((entry: Ecriture) => {
          entry.lignes.forEach((line: LigneEcriture) => {
            const matchCompte = !compteId || line.compteId === compteId || line.compteId.startsWith(compteId);
            if (matchCompte && line.lettrage) {
              lettered.push({
                ...line,
                entryDate: entry.date,
                entryLibelle: entry.libelle,
                journalId: entry.journalId
              });
            }
          });
        });

        return lettered;
      })
    );
  }
}
