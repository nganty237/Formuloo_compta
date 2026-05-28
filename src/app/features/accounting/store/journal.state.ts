import { Ecriture, JournalFilter, JournalStats } from '../../../core/models/ecriture.model';

export interface JournalState {
  entries: Ecriture[];
  filteredEntries: Ecriture[];
  currentFilter: JournalFilter;
  stats: JournalStats | null;
  loading: boolean;
  error: string | null;
  selectedEntry: Ecriture | null;
  exportLoading: boolean;
}

export const initialJournalState: JournalState = {
  entries: [],
  filteredEntries: [],
  currentFilter: {},
  stats: null,
  loading: false,
  error: null,
  selectedEntry: null,
  exportLoading: false
};
