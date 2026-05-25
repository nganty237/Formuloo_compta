import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_ACCOUNTS } from '../../../../core/mocks/mock-accounts';
import { CompteOHADA } from '../../../../core/models/compte-ohada.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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

  // Si c'est déséquilibré, on retourne une erreur nommée 'desequilibre'
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
export class EntryFormComponent {
  
  private fb = inject(FormBuilder);
  comptesOHADA: CompteOHADA[] = MOCK_ACCOUNTS;

  // On attache notre validateur à l'objet racine pour qu'il surveille tout
  entryForm = this.fb.group({
    libelle: ['', Validators.required],
    date: ['', Validators.required],
    lignesEcriture: this.fb.array([]) // Un tableau vide au départ
  }, { validators: partieDoubleValidator });

  // Un "getter" pour simplifier l'accès au tableau dans le HTML et le TS
  get lignesEcriture(): FormArray {
    return this.entryForm.get('lignesEcriture') as FormArray;
  }

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
      console.log('Ecriture prête pour le LedgerService :', this.entryForm.value);
    }
  }
}