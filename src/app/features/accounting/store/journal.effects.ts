import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as JournalActions from './journal.actions';
import { JournalService } from '../services/journal.service';
import {  TenantContextService  } from '@core';

@Injectable()
export class JournalEffects {
  private actions$ = inject(Actions);
  private journalService = inject(JournalService);
  private tenantContext = inject(TenantContextService);

  // Load journal entries on request
  loadJournal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JournalActions.loadJournal),
      switchMap(({ entrepriseId }) =>
        this.journalService.getJournal(entrepriseId).pipe(
          map(entries => JournalActions.journalLoaded({ entries })),
          catchError(error =>
            of(JournalActions.journalError({ error: error.message }))
          )
        )
      )
    )
  );

  // Apply journal filters and get stats
  applyFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JournalActions.applyJournalFilter),
      switchMap(({ entrepriseId, filter }) =>
        this.journalService.getJournalFiltered(entrepriseId, filter).pipe(
          switchMap(entries =>
            this.journalService.getJournalStats(entrepriseId, filter).pipe(
              map(stats => JournalActions.journalFiltered({ entries, stats }))
            )
          ),
          catchError(error =>
            of(JournalActions.journalError({ error: error.message }))
          )
        )
      )
    )
  );

  // Search entries with debounce
  searchJournal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JournalActions.searchJournal),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(({ entrepriseId, searchTerm }) =>
        this.journalService.getJournalFiltered(entrepriseId, { searchTerm }).pipe(
          switchMap(entries =>
            this.journalService.getJournalStats(entrepriseId, { searchTerm }).pipe(
              map(stats => JournalActions.journalFiltered({ entries, stats }))
            )
          ),
          catchError(error =>
            of(JournalActions.journalError({ error: error.message }))
          )
        )
      )
    )
  );

  // Validate entry in service
  validateEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JournalActions.validateEntry),
      switchMap(({ entryId }) =>
        this.journalService.validate(entryId).pipe(
          map(entry => JournalActions.entryValidated({ entry })),
          catchError(error =>
            of(JournalActions.journalError({ error: error.message }))
          )
        )
      )
    )
  );

  // Delete entry from service
  deleteEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JournalActions.deleteJournalEntry),
      switchMap(({ entryId }) =>
        this.journalService.delete(entryId).pipe(
          map(() => JournalActions.entryDeleted({ entryId })),
          catchError(error =>
            of(JournalActions.journalError({ error: error.message }))
          )
        )
      )
    )
  );

  // Export journal data
  exportJournal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JournalActions.exportJournal),
      switchMap(({ entrepriseId, filter, format }) =>
        this.journalService.exportData(entrepriseId, filter).pipe(
          map(data => {
            const fileName = `journal-${new Date().toISOString().split('T')[0]}.${format}`;
            return JournalActions.journalExported({ fileName });
          }),
          catchError(error =>
            of(JournalActions.journalError({ error: error.message }))
          )
        )
      )
    )
  );
}
