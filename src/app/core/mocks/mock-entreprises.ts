import { Entreprise } from '../models/entreprise.model';

export const MOCK_ENTREPRISES: Entreprise[] = [
  {
    id: 'ENT-001',
    tenantId: 'tenant-1',
    nom: 'Tech Africa cameroun',
    emailContact: 'contact@africa.cm',
    ninea: '123456789',
    rccm: 'SN.DKR.2023.B.123',
    adresse: 'Plateau, camer'
  },
  {
    id: 'ENT-002',
    tenantId: 'tenant-1',
    nom: 'Boutique Maman',
    emailContact: 'maman@boutique.com',
    ninea: '987654321',
    rccm: 'SN.DKR.2023.A.456',
    adresse: 'Médina, camer'
  },
  {
    id: 'ENT-003',
    tenantId: 'tenant-2',
    nom: 'Consulting Services',
    emailContact: 'info@consulting.sn',
    ninea: '112233445',
    rccm: 'SN.DKR.2022.B.789',
    adresse: 'Almadies, camer'
  }
];
