import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantContextService {

  private currentTenantId = new BehaviorSubject<string | null>(null);
  private currentCompanyId = new BehaviorSubject<string | null>(null);
  private currentCompanyName = new BehaviorSubject<string | null>(null);

  // Sécurité supplémentaire : distinctUntilChanged() garantit que le composant 
  // ne sera pas notifié si la valeur émise est consécutivement la même.
  public tenantId$ = this.currentTenantId.asObservable().pipe(distinctUntilChanged());
  public companyId$ = this.currentCompanyId.asObservable().pipe(distinctUntilChanged());
  public companyName$ = this.currentCompanyName.asObservable().pipe(distinctUntilChanged());

  // Accesseurs synchrones pour les interceptors et services critiques
  get tenantId(): string | null { return this.currentTenantId.value; }
  get companyId(): string | null { return this.currentCompanyId.value; }
  get companyName(): string | null { return this.currentCompanyName.value; }

  /**
   * Met à jour le contexte avec les informations de l'entreprise sélectionnée.
   * @param companyId L'ID de l'entreprise (ex: ID dans la base de données)
   * @param companyName Le nom de l'entreprise (pour affichage dans le Header)
   * @param tenantId L'ID du tenant (optionnel, le cabinet d'expertise comptable)
   */
  selectCompany(companyId: string, companyName: string, tenantId?: string): void {
    // LE GARDE-FOU : On bloque la mise à jour si l'entreprise est déjà celle active
    if (this.currentCompanyId.value === companyId) {
      return; 
    }

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