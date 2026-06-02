import { createAction, props } from '@ngrx/store';
import {  Ecriture  } from '@core';

export const loadEntries = createAction(
  '[Accounting] Load Entries'
);

export const entriesLoaded = createAction(
  '[Accounting] Entries Loaded',
  props<{ entries: Ecriture[] }>()
);

export const addEntry = createAction(
  '[Accounting] Add Entry',
  props<{ entry: Ecriture }>()
);

export const updateEntry = createAction(
  '[Accounting] Update Entry',
  props<{ entry: Ecriture }>()
);

export const deleteAccountingEntry = createAction(
  '[Accounting] Delete Entry',
  props<{ entryId: string }>()
);
export const addEntrySuccess = createAction(
  '[Accounting] Add Entry Success', props<{ entry: any }>()
);
// Action vitale pour fermer la modale
export const resetSavedState = createAction(
  '[Accounting] Reset Saved State'
  );