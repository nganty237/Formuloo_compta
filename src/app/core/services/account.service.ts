import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompteOHADA } from '../models/compte-ohada.model';
import {  environment  } from '@env/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comptes`;

  // Liste en mémoire de tous les comptes comptables, initialisée vide
  private accountsList = signal<CompteOHADA[]>([]);

  // Sélecteur réactif de la liste complète des comptes (en lecture seule)
  public accounts = this.accountsList.asReadonly();

  constructor() {}

  /**
   * Charge les comptes d'une entreprise spécifique
   */
  loadAccounts(companyId: string): void {
    this.http.get<CompteOHADA[]>(`${this.apiUrl}?entrepriseId=${companyId}`).subscribe(accounts => {
      const formattedAccounts = accounts.map(acc => ({
        ...acc,
        actif: acc.actif !== undefined ? acc.actif : true
      }));
      
      // On met à jour le cache en fusionnant ou en remplaçant
      this.accountsList.update(current => {
        const others = current.filter(a => a.entrepriseId !== companyId);
        return [...others, ...formattedAccounts];
      });
    });
  }

  /**
   * Récupère les comptes d'une entreprise spécifique (Observable)
   */
  getAccountsForCompany$(companyId: string): Observable<CompteOHADA[]> {
    return this.http.get<CompteOHADA[]>(`${this.apiUrl}?entrepriseId=${companyId}`).pipe(
      tap(accounts => {
        const formatted = accounts.map(acc => ({
            ...acc,
            actif: acc.actif !== undefined ? acc.actif : true
        }));
        this.accountsList.update(current => {
            const others = current.filter(a => a.entrepriseId !== companyId);
            return [...others, ...formatted];
        });
      })
    );
  }

  /**
   * Ajoute un compte et met à jour le cache
   */
  addAccountToCache(account: CompteOHADA): void {
    this.accountsList.update(current => {
        const exists = current.some(a => a.id === account.id);
        return exists ? current : [...current, account];
    });
  }

  /**
   * Ajoute un compte personnalisé pour une entreprise
   */
  addCustomAccount(companyId: string, account: Omit<CompteOHADA, 'id' | 'entrepriseId'>): Observable<CompteOHADA> {
    const newAccount: Partial<CompteOHADA> = {
      ...account,
      id: `cpt-${account.numero}`,
      entrepriseId: companyId,
      actif: true
    };

    return this.http.post<CompteOHADA>(this.apiUrl, newAccount).pipe(
      tap(savedAccount => {
        this.accountsList.update(currentList => [...currentList, savedAccount]);
      })
    );
  }

  /**
   * Active ou désactive un compte comptable
   */
  toggleAccountStatus(accountId: string, isActive: boolean): void {
    this.http.patch<CompteOHADA>(`${this.apiUrl}/${accountId}`, { actif: isActive }).subscribe(() => {
      this.accountsList.update(currentList => 
        currentList.map(acc => 
          acc.id === accountId ? { ...acc, actif: isActive } : acc
        )
      );
    });
  }
}
