export interface JournalEntry {
    id: string;
    date: string;
    pieceRef: string; // Numéro de pièce comptable
    accountDebit: string; // Compte débité (ex: 411100 pour Client)
    accountCredit: string; // Compte crédité (ex: 701100 pour Vente)
    label: string; // Libellé de l'écriture
    amount: number; // Montant (OHADA : Débit = Crédit)
    status: 'draft' | 'validated'; // Brouillon ou Validé
}