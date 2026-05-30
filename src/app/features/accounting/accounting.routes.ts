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
      },
      {
        path: 'resultat',
        loadComponent: () =>
          import('../reports/components/compte-resultat/compte-resultat').then(m => m.CompteResultatComponent)
      },
      {
        path: 'plan-comptable',
        loadComponent: () =>
          import('./pages/plan-comptable/plan-comptable').then(m => m.PlanComptableComponent)
      },
      {
        path: 'tva',
        loadComponent: () =>
          import('./pages/tva-declaration/tva-declaration').then(m => m.TvaDeclarationComponent)
      },
      {
        path: 'lettrage',
        loadComponent: () =>
          import('./pages/lettrage/lettrage').then(m => m.LettrageComponent)
      }
    ]
  }
];
