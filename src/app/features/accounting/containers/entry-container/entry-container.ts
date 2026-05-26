import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { Ecriture } from '../../../../core/models/ecriture.model';
import { loadEntries, addEntry } from '../../store/accounting.actions';
import { selectEntries, selectLoading } from '../../store/accounting.selectors';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table';
import { EntryFormComponent } from '../../pages/entry-from/entry-from'; 

@Component({
  selector: 'app-entry-container',
  standalone: true,
  imports: [CommonModule, TableComponent, EntryFormComponent],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Gestion des Écritures Comptables</h2>
      
      <!-- Composant de formulaire (étape 4), émet un événement 'save' intercepté ici -->
      <div class="bg-white rounded shadow p-4 mb-6">
        <app-entry-form (save)="onSaveEntry($event)"></app-entry-form>
      </div>

      <!-- Liste des écritures avec le composant Table de shared -->
      <div class="bg-white rounded shadow p-4">
        <h3 class="text-xl font-semibold mb-3">Liste des écritures</h3>
        <app-table 
          [data]="(entries$ | async) || []" 
          [columns]="columns" 
          [isLoading]="(loading$ | async) || false">
        </app-table>
      </div>
    </div>
  `
})
export class EntryContainerComponent implements OnInit {
  private store = inject(Store);
  private tenantContextService = inject(TenantContextService);

  entries$!: Observable<Ecriture[]>;
  loading$!: Observable<boolean>;

  columns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'libelle', label: 'Libellé', type: 'text' },
    { key: 'journalId', label: 'Journal', type: 'text' }
  ];

  ngOnInit() {
    this.store.dispatch(loadEntries());

    // 2. Flux de données : Récupération des écritures depuis le Store via le selector
    this.entries$ = this.store.select(selectEntries);
    this.loading$ = this.store.select(selectLoading);

    // Lecture du contexte (pourrait servir pour filtrer par la suite)
    this.tenantContextService.companyId$.subscribe(companyId => {
      console.log('Company ID du contexte actuel :', companyId);
    });
  }

  // 3. Action utilisateur : Le formulaire enfant émet une écriture
  onSaveEntry(entry: Ecriture) {
    // 4. Dispatch de l'action : On demande au Store d'ajouter cette écriture
    this.store.dispatch(addEntry({ entry }));
    
    // Le flux NgRx prend le relais :
    // Action 'addEntry' -> Reducer -> Ajoute à state.entries
    // Le selector 'selectEntries' émet la nouvelle liste
    // Le template (entries$ | async) met à jour la table automatiquement
  }
}