import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { CompteOHADA } from '../../../../core/models/compte-ohada.model';

// 1. NOTRE VALIDATEUR METIER (Custom Validator)
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

  return null; // Tout est OK
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

  // 2. LE FORMULAIRE RACINE
  entryForm = this.fb.group({
    libelle: ['', Validators.required],
    date: ['', Validators.required],
    lignesEcriture: this.fb.array([]) // Un tableau vide au départ
  }, { validators: partieDoubleValidator });

  // Un "getter" pour simplifier l'accès au tableau dans le HTML et le TS
  get lignesEcriture(): FormArray {
    return this.entryForm.get('lignesEcriture') as FormArray;
  }

  ngOnInit() {
    // Récupération dynamique du tenantId depuis l'URL parente (ex: /tenant/tenant-1/accounting)
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
      console.log('Ecriture prête pour le LedgerService :', this.entryForm.value);
    }
  }
}