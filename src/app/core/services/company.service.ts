import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Entreprise } from '../models/entreprise.model';
import { environment } from '../../../environments/environment';

export interface CompanyWithTaxInfo extends Entreprise {
  pays?: string;
  devise?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/entreprises`;

  // Liste des entreprises
  private companiesList = signal<CompanyWithTaxInfo[]>([]);

  // Sélecteur réactif pour obtenir la liste complète
  public companies = this.companiesList.asReadonly();

  constructor() {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.http.get<CompanyWithTaxInfo[]>(this.apiUrl).subscribe(companies => {
      this.companiesList.set(companies);
    });
  }

  /**
   * Récupère une entreprise par son ID
   */
  getCompanyById(id: string): Observable<CompanyWithTaxInfo | undefined> {
    return this.http.get<CompanyWithTaxInfo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Ajoute une nouvelle entreprise au dossier du cabinet
   */
  addCompany(company: Omit<CompanyWithTaxInfo, 'id' | 'tenantId'>): void {
    const newCompany: Partial<CompanyWithTaxInfo> = {
      ...company,
      tenantId: 'tenant-1' // Par défaut rattaché au cabinet de test
    };

    this.http.post<CompanyWithTaxInfo>(this.apiUrl, newCompany).subscribe(savedCompany => {
      this.companiesList.update(list => [...list, savedCompany]);
    });
  }
}
