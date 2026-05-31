import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, forkJoin, of } from 'rxjs';
import { CompteOHADA } from '../../../core/models/compte-ohada.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanComptableService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comptes`;

  getAccounts(entrepriseId: string): Observable<CompteOHADA[]> {
    return this.http.get<CompteOHADA[]>(`${this.apiUrl}?entrepriseId=${entrepriseId}`);
  }

  addAccount(account: CompteOHADA): Observable<CompteOHADA> {
    return this.http.post<CompteOHADA>(this.apiUrl, account);
  }

  updateAccount(id: string, account: Partial<CompteOHADA>): Observable<CompteOHADA> {
    return this.http.patch<CompteOHADA>(`${this.apiUrl}/${id}`, account);
  }

  /**
   * Initialise le plan comptable standard pour une nouvelle entreprise.
   */
  initializeForCompany(entrepriseId: string): Observable<CompteOHADA[]> {
    return this.getAccounts(entrepriseId).pipe(
      switchMap(existing => {
        if (existing.length > 0) return of(existing);

        // On prend un échantillon standard (ceux de ENT-001 dans db.json)
        return this.getAccounts('ENT-001').pipe(
          switchMap(standardPlan => {
            const requests = standardPlan.map(a => {
              const { id, ...data } = a;
              return this.http.post<CompteOHADA>(this.apiUrl, {
                ...data,
                entrepriseId: entrepriseId
              });
            });
            return forkJoin(requests);
          })
        );
      })
    );
  }
}
