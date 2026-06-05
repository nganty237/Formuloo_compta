import {  Ecriture  } from '@core';

export interface AccountingState {
  entries: Ecriture[]; 
  loading: boolean;    
  error: string | null; 
  saved: boolean;
}

export const initialState: AccountingState = {
  entries: [],
  loading: false,
  error: null,
  saved: false
};