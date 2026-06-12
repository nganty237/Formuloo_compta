import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { Entreprise } from '../models/entreprise.model';
import {  environment  } from '@env/environment';
import { AuthService } from './auth.service';

export interface CompanyWithTaxInfo extends Entreprise {
  pays?: string;
  devise?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/entreprises`;

  // Liste des entreprises
  private companiesList = signal<CompanyWithTaxInfo[]>([]);

  // Sélecteur réactif pour obtenir la liste complète
  public companies = this.companiesList.asReadonly();

  // Observable pour attendre le chargement des entreprises (avec cache)
  private companiesLoader$ = this.http.get<CompanyWithTaxInfo[]>(this.apiUrl).pipe(
    tap(companies => this.companiesList.set(companies)),
    shareReplay(1) // Cache la réponse pour eviter les requêtes multiples
  );

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCompanies();
      }
    });
  }

  private loadCompanies(): void {
    this.companiesLoader$.subscribe(); // Lance le chargement et utilise le cache
  }

  /**
   * Récupère la liste des entreprises comme Observable
   * Utile pour les guards qui doivent attendre le chargement
   */
  getCompanies(): Observable<CompanyWithTaxInfo[]> {
    return this.companiesLoader$;
  }

  /**
   * Récupère une entreprise par son ID
   */
  getCompanyById(id: string): Observable<CompanyWithTaxInfo | undefined> {
    return this.http.get<CompanyWithTaxInfo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Filtre les entreprises par tenant
   */
  getCompaniesByTenant(tenantId: string): CompanyWithTaxInfo[] {
    return this.companies().filter(c => c.tenantId === tenantId);
  }

  /**
   * Ajoute une nouvelle entreprise au dossier du cabinet
   */
  addCompany(company: Omit<CompanyWithTaxInfo, 'id' | 'tenantId'>): void {
    const newCompany: Partial<CompanyWithTaxInfo> = {
      ...company,
      tenantId: 'tenant-1'
    };

    this.http.post<CompanyWithTaxInfo>(this.apiUrl, newCompany).subscribe(savedCompany => {
      this.companiesList.update(list => [...list, savedCompany]);
    });
  }
}
