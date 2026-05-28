import { LigneEcriture } from './ligne-ecriture.model';

export interface Ecriture {
    id: string;
    entrepriseId: string;
    journalId: 'ACH' | 'VTE' | 'BQ' | 'OD';
    date: string;
    libelle: string;
    valide: boolean;
    lignes: LigneEcriture[];
    createdAt?: string;
    createdBy?: string;
}

export interface JournalFilter {
    journalId?: string;
    dateDebut?: string;
    dateFin?: string;
    valideOnly?: boolean;
    searchTerm?: string;
}

export interface JournalStats {
    totalEntries: number;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
}
