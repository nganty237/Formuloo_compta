import { Routes } from '@angular/router'; 
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { accountingReducer } from './store/accounting.reducer';
import { journalReducer } from './store/journal.reducer';
import { AccountingEffects } from './store/accounting.effects';
import { JournalEffects } from './store/journal.effects';

import { roleGuard } from '../../core/guards/role-guard';

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
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () =>
          import('./containers/entry-container/entry-container').then(m => m.EntryContainerComponent)
      },
      {
        path: 'entry',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () =>
          import('./containers/entry-container/entry-container').then(m => m.EntryContainerComponent)
      },
      {
        path: 'journal',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () =>
          import('./pages/journal/journal.component').then(m => m.JournalComponent)
      },
      {
        path: 'ledger',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () =>
          import('./pages/ledger/ledger.component').then(m => m.LedgerComponent)
      },
      {
        path: 'balance',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
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
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () =>
          import('./pages/plan-comptable/plan-comptable').then(m => m.PlanComptableComponent)
      },
      {
        path: 'tva',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () =>
          import('./pages/tva-declaration/tva-declaration').then(m => m.TvaDeclarationComponent)
      },
      {
        path: 'lettrage',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COMPTABLE'] },
        loadComponent: () =>
          import('./pages/lettrage/lettrage').then(m => m.LettrageComponent)
      }
    ]
  }
];
