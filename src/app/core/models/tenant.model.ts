export interface Tenant {
    id: string;
    nom: string;
    pays: string;
    devise: string;
    planTarifaire: 'BASIC' | 'PRO' | 'PREMIUM';
}