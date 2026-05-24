import { Tenant } from '../models/tenant.model';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    nom: 'Cabinet Audit & Co',
    pays: 'Côte d\'Ivoire',
    devise: 'XOF',
    planTarifaire: 'PREMIUM'
  },
  {
    id: 'tenant-2',
    nom: 'Sénégal Expertise',
    pays: 'Sénégal',
    devise: 'XOF',
    planTarifaire: 'PRO'
  }
];