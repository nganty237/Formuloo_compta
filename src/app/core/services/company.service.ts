import { Injectable, signal } from '@angular/core';
import { Entreprise } from '../models/entreprise.model';

export interface CompanyWithTaxInfo extends Entreprise {
  pays: string;
  devise: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  // Liste des entreprises mockées rattachées au cabinet
  private companiesList = signal<CompanyWithTaxInfo[]>([
    {
      id: 'tenant-1',
      tenantId: '123',
      nom: 'Tech Solutions SAS',
      ninea: '1234567-SN',
      rccm: 'SN-DKR-2023-B-12',
      adresse: 'Dakar, Sénégal',
      pays: 'Sénégal',
      devise: 'XOF'
    },
    {
      id: 'c-002',
      tenantId: '123',
      nom: 'Boulangerie Le Pain Doré',
      ninea: '7654321-CI',
      rccm: 'CI-ABJ-2023-B-34',
      adresse: 'Abidjan, Côte d\'Ivoire',
      pays: 'Côte d\'Ivoire',
      devise: 'XOF'
    },
    {
      id: 'c-003',
      tenantId: '123',
      nom: 'Douala Tech Hub',
      ninea: 'M1223000456-CM',
      rccm: 'RC/DLA/2024/B/89',
      adresse: 'Akwa, Douala, Cameroun',
      pays: 'Cameroun',
      devise: 'XAF'
    },
    {
      id: 'c-004',
      tenantId: '123',
      nom: 'Libreville Trading',
      ninea: 'GAB-998877-LBV',
      rccm: 'RC/LBV/2024/A/12',
      adresse: 'Bord de Mer, Libreville, Gabon',
      pays: 'Gabon',
      devise: 'XAF'
    }
  ]);

  // Sélecteur réactif pour obtenir la liste complète
  public companies = this.companiesList.asReadonly();

  /**
   * Ajoute une nouvelle entreprise au dossier du cabinet
   */
  addCompany(company: Omit<CompanyWithTaxInfo, 'id' | 'tenantId'>): void {
    const newCompany: CompanyWithTaxInfo = {
      ...company,
      id: `c-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      tenantId: '123' // Par défaut rattaché au cabinet de test
    };
    
    this.companiesList.update(list => [...list, newCompany]);
  }
}
