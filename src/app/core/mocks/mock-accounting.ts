import { JournalEntry } from '../../features/accounting/models/accounting.model';

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
    {
        id: '1',
        date: '2026-05-20',
        pieceRef: 'FACT-2026-001',
        accountDebit: '411100', // Clients
        accountCredit: '701100', // Vente de marchandises
        label: 'Vente de marchandises - Cabinet Expert',
        amount: 150000, // 150 000 FCFA
        status: 'validated'
    },
    {
        id: '2',
        date: '2026-05-21',
        pieceRef: 'CHQ-2026-042',
        accountDebit: '521100', // Banque
        accountCredit: '411100', // Clients
        label: 'Règlement Facture FACT-2026-001',
        amount: 150000,
        status: 'validated'
    },
    {
        id: '3',
        date: '2026-05-22',
        pieceRef: 'OD-2026-005',
        accountDebit: '601100', // Achat de marchandises
        accountCredit: '401100', // Fournisseurs
        label: 'Achat consommables bureau',
        amount: 45000,
        status: 'draft'
    }
];