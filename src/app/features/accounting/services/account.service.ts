import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompteOHADA, AccountService as CoreAccountService } from '@core';

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
    return this.coreAccountService.getAccountsForCompany$(entrepriseId).pipe(
      map(accounts => 
        accounts.filter(a => a.actif !== false)
      )
    );
  }
}
