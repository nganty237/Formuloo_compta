import { Ecriture } from '../../../core/models/ecriture.model';

export interface AccountingState {
  entries: Ecriture[]; 
  loading: boolean;    
  error: string | null; 
}

export const initialState: AccountingState = {
  entries: [],
  loading: false,
  error: null
};