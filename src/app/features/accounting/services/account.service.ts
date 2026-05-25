import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CompteOHADA } from '../../../core/models/compte-ohada.model';
import { MOCK_ACCOUNTS } from '../../../core/mocks/mock-accounts';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  /**
   * Récupère la liste des comptes OHADA d'un Tenant
   * @param entrepriseId L'ID du tenant connecté
   */
  getAccounts(entrepriseId: string): Observable<CompteOHADA[]> {
    const accounts = MOCK_ACCOUNTS.filter(a => a.entrepriseId === entrepriseId);
    return of(accounts).pipe(delay(500));
  }
}
