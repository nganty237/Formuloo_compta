import { CompteOHADA } from '../models/compte-ohada.model';

// Un petit échantillon réaliste du SYSCOHADA pour l'ENT-001
export const MOCK_ACCOUNTS: CompteOHADA[] = [
    { id: 'cpt-101', entrepriseId: 'ENT-001', numero: '101', intitule: 'Capital social', classe: 1, type: 'PASSIF' },
    { id: 'cpt-162', entrepriseId: 'ENT-001', numero: '162', intitule: 'Emprunts obligataires', classe: 1, type: 'PASSIF' },

    { id: 'cpt-211', entrepriseId: 'ENT-001', numero: '211', intitule: 'Frais de recherche', classe: 2, type: 'ACTIF' },
    { id: 'cpt-241', entrepriseId: 'ENT-001', numero: '241', intitule: 'Matériel et outillage', classe: 2, type: 'ACTIF' },
    { id: 'cpt-244', entrepriseId: 'ENT-001', numero: '244', intitule: 'Matériel de bureau et informatique', classe: 2, type: 'ACTIF' },

    { id: 'cpt-311', entrepriseId: 'ENT-001', numero: '311', intitule: 'Marchandises', classe: 3, type: 'ACTIF' },

    { id: 'cpt-401', entrepriseId: 'ENT-001', numero: '401', intitule: 'Fournisseurs d\'exploitation', classe: 4, type: 'PASSIF' },
    { id: 'cpt-411', entrepriseId: 'ENT-001', numero: '411', intitule: 'Clients', classe: 4, type: 'ACTIF' },
    { id: 'cpt-421', entrepriseId: 'ENT-001', numero: '421', intitule: 'Personnel, salaires dus', classe: 4, type: 'PASSIF' },
    { id: 'cpt-431', entrepriseId: 'ENT-001', numero: '431', intitule: 'Sécurité sociale', classe: 4, type: 'PASSIF' },
    { id: 'cpt-443', entrepriseId: 'ENT-001', numero: '443', intitule: 'État, TVA facturée', classe: 4, type: 'PASSIF' },
    { id: 'cpt-445', entrepriseId: 'ENT-001', numero: '445', intitule: 'État, TVA récupérable', classe: 4, type: 'ACTIF' },

    { id: 'cpt-521', entrepriseId: 'ENT-001', numero: '521', intitule: 'Banques locales', classe: 5, type: 'ACTIF' },
    { id: 'cpt-571', entrepriseId: 'ENT-001', numero: '571', intitule: 'Caisse', classe: 5, type: 'ACTIF' },

    { id: 'cpt-601', entrepriseId: 'ENT-001', numero: '601', intitule: 'Achats de marchandises', classe: 6, type: 'CHARGE' },
    { id: 'cpt-622', entrepriseId: 'ENT-001', numero: '622', intitule: 'Locations et charges locatives', classe: 6, type: 'CHARGE' },
    { id: 'cpt-661', entrepriseId: 'ENT-001', numero: '661', intitule: 'Rémunérations du personnel', classe: 6, type: 'CHARGE' },

    { id: 'cpt-701', entrepriseId: 'ENT-001', numero: '701', intitule: 'Ventes de marchandises', classe: 7, type: 'PRODUIT' },
    { id: 'cpt-706', entrepriseId: 'ENT-001', numero: '706', intitule: 'Services vendus', classe: 7, type: 'PRODUIT' },

    { id: 'cpt-821', entrepriseId: 'ENT-001', numero: '821', intitule: 'Charges hors activités ordinaires', classe: 8, type: 'CHARGE' }
];