export interface Facture {
    id: string;
    entrepriseId: string;
    clientId: string;
    numero: string;
    date: string;
    type: 'DEVIS' | 'FACTURE' | 'AVOIR';
    statut: 'BROUILLON' | 'ENVOYEE' | 'PAYEE' | 'ANNULEE';
    montantHt: number;
    tva: number;
    montantTtc: number;
    compteProduitId?: string;
    description?: string;
}