import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, delay, withLatestFrom } from 'rxjs/operators';
import * as AccountingActions from './accounting.actions';
import { EntryService } from '../services/entry.service';
import {  TenantContextService  } from '@core';

@Injectable()
export class AccountingEffects {
  private actions$ = inject(Actions);
  private entryService = inject(EntryService);
  private tenantContext = inject(TenantContextService);

  loadEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountingActions.loadEntries),
      withLatestFrom(this.tenantContext.companyId$),
      mergeMap(([action, companyId]: [any, string | null]) =>
        this.entryService.getAll(companyId || 'tenant-1').pipe(
          delay(300),
          map((entries: any[]) => AccountingActions.entriesLoaded({ entries })),
          catchError((error: any) =>
            of({ type: '[Accounting] Load Entries Failure', error })
          )
        )
      )
    )
  );
  addEntry$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AccountingActions.addEntry),
    mergeMap(({ entry }: { entry: any }) =>
      this.entryService.create(entry).pipe(
        map((created: any) => AccountingActions.addEntrySuccess({ entry: created })),
        catchError((error: any) => of({ type: '[Accounting] Add Entry Failure', error }))
      )
    )
  )
);
}
