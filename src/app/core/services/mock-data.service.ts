import { Injectable } from '@angular/core';
import { CompteOHADA } from '../models/compte-ohada.model';
import { Ecriture } from '../models/ecriture.model';
import { Facture } from '../models/facture.model';
import { MOCK_ACCOUNTS } from '../mocks/mock-accounts';
import { MOCK_ENTRIES } from '../mocks/mock-entries';
import { MOCK_FACTURES } from '../mocks/mock-factures';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  /**
   * C'est notre "Base de données" en mémoire pour le prototype.
   * On utilise les références directes pour assurer la synchronisation entre tous les services.
   */
  public accounts: CompteOHADA[] = [...MOCK_ACCOUNTS];
  public entries: Ecriture[] = [...MOCK_ENTRIES];
  public factures: Facture[] = [...MOCK_FACTURES];

  constructor() {}
}
