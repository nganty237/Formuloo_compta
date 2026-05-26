import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { CompteOHADA } from '../../../../core/models/compte-ohada.model';
import { Ecriture } from '../../../../core/models/ecriture.model';

// Il vérifie que la somme des débits = somme des crédits.
function partieDoubleValidator(control: AbstractControl): ValidationErrors | null {
  const formGroup = control as FormGroup;
  const lignes = formGroup.get('lignesEcriture') as FormArray;
  
  if (!lignes) return null;

  let totalDebit = 0;
  let totalCredit = 0;

  for (let ligne of lignes.controls) {
    totalDebit += Number(ligne.get('debit')?.value) || 0;
    totalCredit += Number(ligne.get('credit')?.value) || 0;
  }

  if (totalDebit !== totalCredit) {
    return { desequilibre: true }; 
  }

  return null; 
}

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './entry-from.html'
})
export class EntryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);

  comptes$!: Observable<CompteOHADA[]>;
  tenantId: string = 'tenant-1';

  @Output() save = new EventEmitter<Ecriture>();

  entryForm = this.fb.group({
    libelle: ['', Validators.required],
    date: ['', Validators.required],
    lignesEcriture: this.fb.array([])
  }, { validators: partieDoubleValidator });

  get lignesEcriture(): FormArray {
    return this.entryForm.get('lignesEcriture') as FormArray;
  }

  ngOnInit() {
    const urlTenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (urlTenantId) {
      this.tenantId = urlTenantId;
    }

    // Chargement des comptes via le service
    this.comptes$ = this.accountService.getAccounts(this.tenantId);
  }

  // 3. METHODES DYNAMIQUES
  addLigne() {
    // Création d'une ligne d'écriture (un nouveau FormGroup)
    const ligneForm = this.fb.group({
      compte: ['', Validators.required],
      debit: [0, Validators.min(0)],
      credit: [0, Validators.min(0)]
    });
    this.lignesEcriture.push(ligneForm);
  }

  removeLigne(index: number) {
    this.lignesEcriture.removeAt(index);
  }

   onSubmit() {
    if (this.entryForm.valid) {
      const formValue = this.entryForm.value;

      // Construction de l'objet Ecriture selon l'interface attendue par NgRx
      const ecriture: Ecriture = {
        id: `entry-${Date.now()}`,
        entrepriseId: this.tenantId,
        journalId: 'OD', 
        date: formValue.date || '',
        libelle: formValue.libelle || '',
        valide: true,
        lignes: (formValue.lignesEcriture || []).map((ligne: any, index: number) => ({
          id: `ligne-${Date.now()}-${index}`,
          ecritureId: '', 
          compteId: ligne.compte,
          debit: Number(ligne.debit) || 0,
          credit: Number(ligne.credit) || 0
        }))
      };

      // Émission de l'événement vers le composant parent (EntryContainer)
      this.save.emit(ecriture);
      
      this.entryForm.reset();
      this.lignesEcriture.clear();
    }
  }

}