import { LigneEcriture } from './ligne-ecriture.model';

export interface Ecriture {
    id: string;
    entrepriseId: string;
    journalId: string;
    date: string;
    libelle: string;
    valide: boolean;
    lignes: LigneEcriture[];
}