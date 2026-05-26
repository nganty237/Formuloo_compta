import { createReducer, on } from '@ngrx/store';
import { AccountingState, initialState } from './accounting.state'
import * as AccountingActions from './accounting.actions';

export const accountingReducer = createReducer(
  initialState,
  on(AccountingActions.loadEntries, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AccountingActions.entriesLoaded, (state, { entries }) => ({
    ...state,
    entries,
    loading: false,
    error: null
  })),
  on(AccountingActions.addEntry, (state, { entry }) => ({
    ...state,
    entries: [...state.entries, entry]
  })),
  on(AccountingActions.updateEntry, (state, { entry }) => ({
    ...state,
    entries: state.entries.map((e) => (e.id === entry.id ? entry : e))
  })),
  on(AccountingActions.deleteEntry, (state, { entryId }) => ({
    ...state,
    entries: state.entries.filter((e) => e.id !== entryId)
  }))
);
