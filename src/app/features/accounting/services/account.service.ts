import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompteOHADA } from '../../../core/models/compte-ohada.model';
import { AccountService as CoreAccountService } from '../../../core/services/account.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private coreAccountService = inject(CoreAccountService);
  private accounts$ = toObservable(this.coreAccountService.accounts);

  /**
   * Récupère la liste des comptes OHADA actifs d'une entreprise
   * @param entrepriseId L'ID de l'entreprise connectée
   */
  getAccounts(entrepriseId: string): Observable<CompteOHADA[]> {
    return this.accounts$.pipe(
      map(accounts => 
        accounts.filter(a => a.entrepriseId === entrepriseId && a.actif !== false)
      )
    );
  }
}
