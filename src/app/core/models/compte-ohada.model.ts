export interface CompteOHADA {
    id: string;
    entrepriseId: string;
    numero: string;
    intitule: string;
    classe: number;
    type: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT';
}