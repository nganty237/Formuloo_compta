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

  constructor() {
    this.loadAccounts();
  }

  /**
   * Charge les comptes depuis l'API
   */
  private loadAccounts(): void {
    this.http.get<CompteOHADA[]>(this.apiUrl).subscribe(accounts => {
      this.accountsList.set(accounts.map(acc => ({
        ...acc,
        actif: acc.actif !== undefined ? acc.actif : true
      })));
    });
  }

  /**
   * Récupère les comptes d'une entreprise spécifique
   */
  getAccountsForCompany(companyId: string): CompteOHADA[] {
    return this.accountsList().filter(acc => acc.entrepriseId === companyId);
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
