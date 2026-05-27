import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, delay, withLatestFrom } from 'rxjs/operators';
import * as AccountingActions from './accounting.actions';
import { EntryService } from '../services/entry.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';

@Injectable()
export class AccountingEffects {
  private actions$ = inject(Actions);
  private entryService = inject(EntryService);
  private tenantContext = inject(TenantContextService);

  loadEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountingActions.loadEntries),
      withLatestFrom(this.tenantContext.companyId$),
      mergeMap(([action, companyId]) =>
        this.entryService.getAll(companyId || 'tenant-1').pipe(
          delay(300),
          map(entries => AccountingActions.entriesLoaded({ entries })),
          catchError(error =>
            of({ type: '[Accounting] Load Entries Failure', error })
          )
        )
      )
    )
  );
  addEntry$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AccountingActions.addEntry),
    mergeMap(({ entry }) =>
      this.entryService.create(entry).pipe(
        map(created => AccountingActions.addEntrySuccess({ entry: created })),
        catchError(error => of({ type: '[Accounting] Add Entry Failure', error }))
      )
    )
  )
);
}
