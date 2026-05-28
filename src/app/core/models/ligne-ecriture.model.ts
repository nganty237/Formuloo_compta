export interface LigneEcriture {
    id: string;
    ecritureId: string;
    compteId: string;
    debit: number;
    credit: number;
    libelle?: string;
    referenceCompte?: string;
}
