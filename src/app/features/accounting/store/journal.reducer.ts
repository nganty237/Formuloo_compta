import { createReducer, on } from '@ngrx/store';
import { JournalState, initialJournalState } from './journal.state';
import * as JournalActions from './journal.actions';

export const journalReducer = createReducer(
  initialJournalState,

  // Load journal
  on(JournalActions.loadJournal, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(JournalActions.journalLoaded, (state, { entries }) => ({
    ...state,
    entries,
    filteredEntries: entries,
    loading: false
  })),

  // Apply filter
  on(JournalActions.applyJournalFilter, (state) => ({
    ...state,
    loading: true
  })),

  on(JournalActions.journalFiltered, (state, { entries, stats }) => ({
    ...state,
    filteredEntries: entries,
    stats,
    loading: false
  })),

  // Search
  on(JournalActions.searchJournal, (state) => ({
    ...state,
    loading: true
  })),

  // Validate entry
  on(JournalActions.validateEntry, (state) => ({
    ...state,
    loading: true
  })),

  on(JournalActions.entryValidated, (state, { entry }) => ({
    ...state,
    entries: state.entries.map(e => e.id === entry.id ? entry : e),
    filteredEntries: state.filteredEntries.map(e => e.id === entry.id ? entry : e),
    loading: false
  })),

  // Delete entry
  on(JournalActions.deleteJournalEntry, (state) => ({
    ...state,
    loading: true
  })),

  on(JournalActions.entryDeleted, (state, { entryId }) => ({
    ...state,
    entries: state.entries.filter(e => e.id !== entryId),
    filteredEntries: state.filteredEntries.filter(e => e.id !== entryId),
    loading: false
  })),

  // Export
  on(JournalActions.exportJournal, (state) => ({
    ...state,
    exportLoading: true
  })),

  on(JournalActions.journalExported, (state) => ({
    ...state,
    exportLoading: false
  })),

  // Error
  on(JournalActions.journalError, (state, { error }) => ({
    ...state,
    error,
    loading: false,
    exportLoading: false
  }))
);
