import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { accountingReducer } from './store/accounting.reducer';
import { journalReducer } from './store/journal.reducer';
import { AccountingEffects } from './store/accounting.effects';
import { JournalEffects } from './store/journal.effects';

export const accountingRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState({ name: 'accounting', reducer: accountingReducer }),
      provideState({ name: 'journal', reducer: journalReducer }),
      provideEffects(AccountingEffects),
      provideEffects(JournalEffects)
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/accounting-home/accounting-home').then(m => m.AccountingHomeComponent)
      },
      {
        path: 'new-entry',
        loadComponent: () =>
          import('./containers/entry-container/entry-container').then(m => m.EntryContainerComponent)
      },
      {
        path: 'entry',
        loadComponent: () =>
          import('./containers/entry-container/entry-container').then(m => m.EntryContainerComponent)
      },
      {
        path: 'journal',
        loadComponent: () =>
          import('./pages/journal/journal.component').then(m => m.JournalComponent)
      },
      {
        path: 'ledger',
        loadComponent: () =>
          import('./pages/ledger/ledger.component').then(m => m.LedgerComponent)
      },
      {
        path: 'balance',
        loadComponent: () =>
          import('./pages/balance/balance.component').then(m => m.BalanceComponent)
      },
      {
        path: 'bilan',
        loadComponent: () =>
          import('../reports/components/bilan/bilan').then(m => m.BilanComponent)
      }
    ]
  }
];
