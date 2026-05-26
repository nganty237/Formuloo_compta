import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantContextService {

  private currentTenantId = new BehaviorSubject<string | null>(null);
  private currentCompanyId = new BehaviorSubject<string | null>(null);
  private currentCompanyName = new BehaviorSubject<string | null>(null);

  public tenantId$ = this.currentTenantId.asObservable();
  public companyId$ = this.currentCompanyId.asObservable();
  public companyName$ = this.currentCompanyName.asObservable();

  /**
   * Met à jour le contexte avec les informations de l'entreprise sélectionnée.
   * @param companyId L'ID de l'entreprise (ex: ID dans la base de données)
   * @param companyName Le nom de l'entreprise (pour affichage dans le Header)
   * @param tenantId L'ID du tenant (optionnel, le cabinet d'expertise comptable)
   */

  selectCompany(companyId: string, companyName: string, tenantId?: string): void {
    this.currentCompanyId.next(companyId);
    this.currentCompanyName.next(companyName);
    if (tenantId) {
      this.currentTenantId.next(tenantId);
    }
  }

  /**
   * Réinitialise le contexte (utile lors de la déconnexion par exemple ou changement de vue globale).
   */
  clear(): void {
    this.currentTenantId.next(null);
    this.currentCompanyId.next(null);
    this.currentCompanyName.next(null);
  }
}