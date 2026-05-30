import { Injectable, signal } from '@angular/core';
import { CompteOHADA } from '../models/compte-ohada.model';
import { MOCK_ACCOUNTS } from '../mocks/mock-accounts';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  // Liste en mémoire de tous les comptes comptables, initialisée par les mocks
  private accountsList = signal<CompteOHADA[]>(
    MOCK_ACCOUNTS.map(acc => ({
      ...acc,
      actif: acc.actif !== undefined ? acc.actif : true // Tous actifs par défaut
    }))
  );

  // Sélecteur réactif de la liste complète des comptes (en lecture seule)
  public accounts = this.accountsList.asReadonly();

  /**
   * Récupère les comptes d'une entreprise spécifique
   */
  getAccountsForCompany(companyId: string): CompteOHADA[] {
    return this.accountsList().filter(acc => acc.entrepriseId === companyId);
  }

  /**
   * Ajoute un compte personnalisé pour une entreprise
   */
  addCustomAccount(companyId: string, account: Omit<CompteOHADA, 'id' | 'entrepriseId'>): boolean {
    const list = this.accountsList();
    
    // Vérifier si le numéro de compte existe déjà pour cette entreprise
    const exists = list.some(acc => acc.entrepriseId === companyId && acc.numero === account.numero);
    if (exists) {
      return false; // Le compte existe déjà
    }

    const newAccount: CompteOHADA = {
      ...account,
      id: `cpt-${account.numero}`,
      entrepriseId: companyId,
      actif: true
    };

    this.accountsList.update(currentList => [...currentList, newAccount]);
    return true;
  }

  /**
   * Active ou désactive un compte comptable
   */
  toggleAccountStatus(accountId: string, isActive: boolean): void {
    this.accountsList.update(currentList => 
      currentList.map(acc => 
        acc.id === accountId ? { ...acc, actif: isActive } : acc
      )
    );
  }
}
