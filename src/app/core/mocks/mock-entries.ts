import { Ecriture } from '../models/ecriture.model';

export const MOCK_ENTRIES: Ecriture[] = [
    {
        id: 'entry-1', entrepriseId: 'ENT-001', journalId: 'ACH', date: '2024-01-10', libelle: 'Achat de marchandises', valide: true,
        lignes: [
            { id: 'l1', ecritureId: 'entry-1', compteId: 'cpt-601', debit: 500000, credit: 0 },
            { id: 'l2', ecritureId: 'entry-1', compteId: 'cpt-445', debit: 90000, credit: 0 },
            { id: 'l3', ecritureId: 'entry-1', compteId: 'cpt-401', debit: 0, credit: 590000 }
        ]
    },
    {
        id: 'entry-2', entrepriseId: 'ENT-001', journalId: 'VTE', date: '2024-01-15', libelle: 'Vente de services', valide: true,
        lignes: [
            { id: 'l4', ecritureId: 'entry-2', compteId: 'cpt-411', debit: 1180000, credit: 0 },
            { id: 'l5', ecritureId: 'entry-2', compteId: 'cpt-706', debit: 0, credit: 1000000 },
            { id: 'l6', ecritureId: 'entry-2', compteId: 'cpt-443', debit: 0, credit: 180000 }
        ]
    },
    {
        id: 'entry-3', entrepriseId: 'ENT-001', journalId: 'BQ', date: '2024-01-18', libelle: 'Paiement fournisseur', valide: false,
        lignes: [
            { id: 'l7', ecritureId: 'entry-3', compteId: 'cpt-401', debit: 590000, credit: 0 },
            { id: 'l8', ecritureId: 'entry-3', compteId: 'cpt-521', debit: 0, credit: 590000 }
        ]
    },
    {
        id: 'entry-4', entrepriseId: 'ENT-001', journalId: 'BQ', date: '2024-01-20', libelle: 'Encaissement client', valide: false,
        lignes: [
            { id: 'l9', ecritureId: 'entry-4', compteId: 'cpt-521', debit: 1180000, credit: 0 },
            { id: 'l10', ecritureId: 'entry-4', compteId: 'cpt-411', debit: 0, credit: 1180000 }
        ]
    },
    {
        id: 'entry-5', entrepriseId: 'ENT-001', journalId: 'OD', date: '2024-01-31', libelle: 'Provision salaires', valide: false,
        lignes: [
            { id: 'l11', ecritureId: 'entry-5', compteId: 'cpt-661', debit: 2000000, credit: 0 },
            { id: 'l12', ecritureId: 'entry-5', compteId: 'cpt-421', debit: 0, credit: 2000000 }
        ]
    }
];