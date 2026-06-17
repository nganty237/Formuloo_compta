import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, of, tap, catchError } from 'rxjs';
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
  private companiesLoader$ = (tenantId: string | null) => {
    if (!tenantId) return of([]);
    return this.http.get<CompanyWithTaxInfo[]>(`${this.apiUrl}?tenantId=${tenantId}`).pipe(
      tap(companies => this.companiesList.set(companies))
    );
  }

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCompanies(user.tenantId);
      } else {
        this.companiesList.set([]);
      }
    });
  }

  private loadCompanies(tenantId: string | null): void {
    this.companiesLoader$(tenantId).subscribe();
  }

  /**
   * Récupère la liste des entreprises pour un tenant spécifique
   */
  getCompanies(tenantId?: string | null): Observable<CompanyWithTaxInfo[]> {
    const tid = tenantId || this.authService.currentUserValue?.tenantId;
    if (!tid) return of([]);
    return this.http.get<CompanyWithTaxInfo[]>(`${this.apiUrl}?tenantId=${tid}`).pipe(
        tap(companies => this.companiesList.set(companies))
    );
  }

  /**
   * Récupère une entreprise par son ID (vérifie le cache local en priorité)
   */
  getCompanyById(id: string): Observable<CompanyWithTaxInfo | undefined> {
    const cached = this.companiesList().find(c => c.id === id);
    if (cached) return of(cached);
    
    return this.http.get<CompanyWithTaxInfo>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }

  /**
   * Ajoute manuellement une entreprise au cache local (utile après création)
   */
  addCompanyToCache(company: CompanyWithTaxInfo): void {
    this.companiesList.update(list => {
        const exists = list.some(c => c.id === company.id);
        return exists ? list : [...list, company];
    });
  }

  /**
   * Ajoute une nouvelle entreprise au dossier du cabinet
   */
  addCompany(company: Omit<CompanyWithTaxInfo, 'id' | 'tenantId'>): void {
    const user = this.authService.currentUserValue;
    if (!user || !user.tenantId) return;

    const newCompany: Partial<CompanyWithTaxInfo> = {
      ...company,
      tenantId: user.tenantId
    };

    this.http.post<CompanyWithTaxInfo>(this.apiUrl, newCompany as CompanyWithTaxInfo).subscribe(savedCompany => {
      this.companiesList.update(list => [...list, savedCompany]);
    });
  }
}
