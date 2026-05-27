import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { accountingReducer } from './store/accounting.reducer';
import { AccountingEffects } from './store/accounting.effects';

export const accountingRoutes: Routes = [
  {
    path: '',
    // Les providers déclarés ici sont disponibles pour toutes les routes enfants
    providers: [
      provideState({ name: 'accounting', reducer: accountingReducer }),
      provideEffects(AccountingEffects)
    ],
    children: [
      {
        path: '', 
        loadComponent: () => import('./pages/accounting-home/accounting-home').then(m => m.AccountingHomeComponent)
      },
      {
        path: 'new-entry',
        loadComponent: () => import('./containers/entry-container/entry-container').then(m => m.EntryContainerComponent)
      },
      {
        path: 'entry',
        loadComponent: () => import('./containers/entry-container/entry-container').then(m => m.EntryContainerComponent)
      },
      {
        path: 'ledger',
        loadComponent: () => import('./components/ledger/ledger.component').then(m => m.LedgerComponent)
      },
      {
        path: 'balance',
        loadComponent: () => import('./components/balance/balance.component').then(m => m.BalanceComponent)
      },
      {
        path: 'bilan',
        loadComponent: () => import('../reports/components/bilan/bilan').then(m => m.BilanComponent)
      }
    ]
  }
];
