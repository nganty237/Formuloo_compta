import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CompteOHADA } from '../../../core/models/compte-ohada.model';
import { AccountService as CoreAccountService } from '../../../core/services/account.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private coreAccountService = inject(CoreAccountService);

  /**
   * Récupère la liste des comptes OHADA actifs d'une entreprise
   * @param entrepriseId L'ID de l'entreprise connectée
   */
  getAccounts(entrepriseId: string): Observable<CompteOHADA[]> {
    const accounts = this.coreAccountService.accounts()
      .filter(a => a.entrepriseId === entrepriseId && a.actif !== false); // Seulement les comptes actifs
    return of(accounts);
  }
}
