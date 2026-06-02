import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {  environment  } from '@env/environment';
import { CompteOHADA } from '../models/compte-ohada.model';
import { Ecriture } from '../models/ecriture.model';
import { firstValueFrom } from 'rxjs';

import { Entreprise } from '../models/entreprise.model';
import { Facture } from '../models/facture.model';
import { Tenant } from '../models/tenant.model';
import { User } from '../models/user.model';

describe('API Contract Testing', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('CompteOHADA Contract', () => {
    it('should match the CompteOHADA interface structure', async () => {
      const mockCompte: CompteOHADA = {
        id: 'cpt-101',
        entrepriseId: 'ENT-001',
        numero: '101',
        intitule: 'Capital social',
        classe: 1,
        type: 'PASSIF'
      };

      const request$ = http.get(`${environment.apiUrl}/comptes/cpt-101`);
      const promise = firstValueFrom(request$);

      const req = httpMock.expectOne(`${environment.apiUrl}/comptes/cpt-101`);
      req.flush(mockCompte);

      const data: any = await promise;

      expect(data).toBeDefined();
      expect(typeof data.id).toBe('string');
      expect(typeof data.entrepriseId).toBe('string');
      expect(typeof data.numero).toBe('string');
      expect(typeof data.intitule).toBe('string');
      expect(typeof data.classe).toBe('number');
      expect(['ACTIF', 'PASSIF', 'CHARGE', 'PRODUIT']).toContain(data.type);
    });
  });

  describe('Ecriture & LigneEcriture Contract', () => {
    it('should match the Ecriture interface structure with embedded lines', async () => {
      const mockEcriture: Ecriture = {
        id: 'entry-1',
        entrepriseId: 'ENT-001',
        journalId: 'ACH',
        date: '2024-01-10',
        libelle: 'Achat de marchandises',
        valide: true,
        lignes: [
          {
            id: 'l1',
            ecritureId: 'entry-1',
            compteId: 'cpt-601',
            debit: 500000,
            credit: 0
          }
        ]
      };

      const request$ = http.get(`${environment.apiUrl}/ecritures/entry-1?_embed=lignes`);
      const promise = firstValueFrom(request$);

      const req = httpMock.expectOne(`${environment.apiUrl}/ecritures/entry-1?_embed=lignes`);
      req.flush(mockEcriture);

      const data: any = await promise;

      // Validate Ecriture
      expect(typeof data.id).toBe('string');
      expect(typeof data.entrepriseId).toBe('string');
      expect(['ACH', 'VTE', 'BQ', 'OD']).toContain(data.journalId);
      expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof data.libelle).toBe('string');
      expect(typeof data.valide).toBe('boolean');
      
      // Validate Lignes
      expect(Array.isArray(data.lignes)).toBe(true);
      expect(data.lignes.length).toBeGreaterThan(0);
      
      const ligne = data.lignes[0];
      expect(typeof ligne.id).toBe('string');
      expect(ligne.ecritureId).toBe(data.id);
      expect(typeof ligne.compteId).toBe('string');
      expect(typeof ligne.debit).toBe('number');
      expect(typeof ligne.credit).toBe('number');
    });
  });

  describe('Entreprise Contract', () => {
    it('should match the Entreprise interface structure', async () => {
      const mockEntreprise: Entreprise = {
        id: 'ENT-001',
        tenantId: 'tenant-1',
        nom: 'Tech Africa Cameroun',
        ninea: '123456789',
        rccm: 'SN.DKR.2023.B.123',
        adresse: 'Plateau, Cameroun'
      };

      const request$ = http.get(`${environment.apiUrl}/entreprises/ENT-001`);
      const promise = firstValueFrom(request$);

      const req = httpMock.expectOne(`${environment.apiUrl}/entreprises/ENT-001`);
      req.flush(mockEntreprise);

      const data: any = await promise;

      expect(typeof data.id).toBe('string');
      expect(typeof data.tenantId).toBe('string');
      expect(typeof data.nom).toBe('string');
      expect(typeof data.ninea).toBe('string');
      expect(typeof data.rccm).toBe('string');
      expect(typeof data.adresse).toBe('string');
    });
  });

  describe('Facture Contract', () => {
    it('should match the Facture interface structure', async () => {
      const mockFacture: Facture = {
        id: 'FAC-001',
        entrepriseId: 'ENT-001',
        clientId: 'CLI-001',
        numero: 'F2023-0001',
        date: '2023-10-01',
        type: 'FACTURE',
        statut: 'PAYEE',
        montantHt: 500000,
        tva: 90000,
        montantTtc: 590000
      };

      const request$ = http.get(`${environment.apiUrl}/factures/FAC-001`);
      const promise = firstValueFrom(request$);

      const req = httpMock.expectOne(`${environment.apiUrl}/factures/FAC-001`);
      req.flush(mockFacture);

      const data: any = await promise;

      expect(typeof data.id).toBe('string');
      expect(['DEVIS', 'FACTURE', 'AVOIR']).toContain(data.type);
      expect(['BROUILLON', 'ENVOYEE', 'PAYEE', 'ANNULEE']).toContain(data.statut);
      expect(typeof data.montantHt).toBe('number');
      expect(typeof data.tva).toBe('number');
      expect(typeof data.montantTtc).toBe('number');
    });
  });

  describe('Tenant Contract', () => {
    it('should match the Tenant interface structure', async () => {
      const mockTenant: Tenant = {
        id: 'tenant-1',
        nom: 'Cabinet Audit & Co',
        pays: 'Côte d\'Ivoire',
        devise: 'XOF',
        planTarifaire: 'PREMIUM'
      };

      const request$ = http.get(`${environment.apiUrl}/tenants/tenant-1`);
      const promise = firstValueFrom(request$);

      const req = httpMock.expectOne(`${environment.apiUrl}/tenants/tenant-1`);
      req.flush(mockTenant);

      const data: any = await promise;

      expect(typeof data.id).toBe('string');
      expect(typeof data.nom).toBe('string');
      expect(['BASIC', 'PRO', 'PREMIUM']).toContain(data.planTarifaire);
    });
  });

  describe('User Contract', () => {
    it('should match the User interface structure', async () => {
      const mockUser: User = {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'admin@audit-co.ci',
        role: 'ADMIN'
      };

      const request$ = http.get(`${environment.apiUrl}/users/user-1`);
      const promise = firstValueFrom(request$);

      const req = httpMock.expectOne(`${environment.apiUrl}/users/user-1`);
      req.flush(mockUser);

      const data: any = await promise;

      expect(typeof data.id).toBe('string');
      expect(typeof data.tenantId).toBe('string');
      expect(data.email).toContain('@');
      expect(['ADMIN', 'COMPTABLE', 'CLIENT']).toContain(data.role);
    });
  });
});
