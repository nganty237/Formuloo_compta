import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CompteOHADA } from '../../../core/models/compte-ohada.model';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class PlanComptableService {
  private mockData = inject(MockDataService);

  getAccounts(entrepriseId: string): Observable<CompteOHADA[]> {
    const data = this.mockData.accounts.filter(a => a.entrepriseId === entrepriseId);
    return of(data).pipe(delay(500));
  }

  addAccount(account: CompteOHADA): Observable<CompteOHADA> {
    this.mockData.accounts.push(account);
    return of(account).pipe(delay(300));
  }

  updateAccount(id: string, account: Partial<CompteOHADA>): Observable<CompteOHADA> {
    const idx = this.mockData.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
        this.mockData.accounts[idx] = { ...this.mockData.accounts[idx], ...account };
        return of(this.mockData.accounts[idx]).pipe(delay(300));
    }
    throw new Error('Account not found');
  }

  /**
   * Initialise le plan comptable standard pour une nouvelle entreprise.
   */
  initializeForCompany(entrepriseId: string): Observable<CompteOHADA[]> {
    // Si l'entreprise a déjà des comptes, on ne fait rien
    const existing = this.mockData.accounts.filter(a => a.entrepriseId === entrepriseId);
    if (existing.length > 0) return of(existing);

    // On prend un échantillon standard (ex: ceux de tenant-1) et on les clone pour la nouvelle entreprise
    const standardPlan = this.mockData.accounts.filter(a => a.entrepriseId === 'tenant-1');
    const newPlan: CompteOHADA[] = standardPlan.map(a => ({
      ...a,
      id: `cpt-${entrepriseId}-${a.numero}`,
      entrepriseId: entrepriseId
    }));
    
    this.mockData.accounts.push(...newPlan);
    return of(newPlan).pipe(delay(800));
  }
}
