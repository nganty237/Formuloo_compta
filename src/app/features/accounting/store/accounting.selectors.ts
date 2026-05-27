import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountingState } from './accounting.state';

export const selectAccountingState = createFeatureSelector<AccountingState>('accounting');

export const selectEntries = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.entries
);

export const selectLoading = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.loading
);

export const selectError = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.error
);
export const selectSaved = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.saved
);