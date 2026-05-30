import { Entreprise } from '../models/entreprise.model';

export const MOCK_ENTREPRISES: Entreprise[] = [
  {
    id: 'ENT-001',
    tenantId: 'TENANT-1',
    nom: 'Tech Africa Dakar',
    ninea: '123456789',
    rccm: 'SN.DKR.2023.B.123',
    adresse: 'Plateau, Dakar'
  },
  {
    id: 'ENT-002',
    tenantId: 'TENANT-1',
    nom: 'Boutique Maman',
    ninea: '987654321',
    rccm: 'SN.DKR.2023.A.456',
    adresse: 'Médina, Dakar'
  },
  {
    id: 'ENT-003',
    tenantId: 'TENANT-2',
    nom: 'Consulting Services',
    ninea: '112233445',
    rccm: 'SN.DKR.2022.B.789',
    adresse: 'Almadies, Dakar'
  }
];
