import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JournalState } from './journal.state';

export const selectJournalState = createFeatureSelector<JournalState>('journal');

// Simple selectors
export const selectAllEntries = createSelector(
  selectJournalState,
  (state: JournalState) => state.entries
);

export const selectFilteredEntries = createSelector(
  selectJournalState,
  (state: JournalState) => state.filteredEntries
);

export const selectJournalStats = createSelector(
  selectJournalState,
  (state: JournalState) => state.stats
);

export const selectJournalLoading = createSelector(
  selectJournalState,
  (state: JournalState) => state.loading
);

export const selectJournalError = createSelector(
  selectJournalState,
  (state: JournalState) => state.error
);

export const selectExportLoading = createSelector(
  selectJournalState,
  (state: JournalState) => state.exportLoading
);

// Composite selectors
export const selectValidatedEntriesOnly = createSelector(
  selectFilteredEntries,
  (entries) => entries.filter(e => e.valide)
);

export const selectPendingEntriesOnly = createSelector(
  selectFilteredEntries,
  (entries) => entries.filter(e => !e.valide)
);

export const selectEntriesByJournal = (journalId: string) =>
  createSelector(
    selectFilteredEntries,
    (entries) => entries.filter(e => e.journalId === journalId)
  );

export const selectBalanceStatus = createSelector(
  selectJournalStats,
  (stats) => stats?.isBalanced ?? false
);
