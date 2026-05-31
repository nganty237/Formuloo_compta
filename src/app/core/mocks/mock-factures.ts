import { Facture } from '../models/facture.model';

export const MOCK_FACTURES: Facture[] = [
  {
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
  },
  {
    id: 'FAC-002',
    entrepriseId: 'ENT-001',
    clientId: 'CLI-002',
    numero: 'F2023-0002',
    date: '2023-10-15',
    type: 'FACTURE',
    statut: 'ENVOYEE',
    montantHt: 1000000,
    tva: 180000,
    montantTtc: 1180000
  },
  {
    id: 'FAC-003',
    entrepriseId: 'ENT-002',
    clientId: 'CLI-003',
    numero: 'F2023-0001',
    date: '2023-11-05',
    type: 'FACTURE',
    statut: 'BROUILLON',
    montantHt: 250000,
    tva: 45000,
    montantTtc: 295000
  }
];
