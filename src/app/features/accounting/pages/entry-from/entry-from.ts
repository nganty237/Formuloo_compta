import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { CompteOHADA } from '../../../../core/models/compte-ohada.model';
import { Ecriture } from '../../../../core/models/ecriture.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { IconComponent } from '../../../../shared/components/icon/icon';

function partieDoubleValidator(control: AbstractControl): ValidationErrors | null {
  const formGroup = control as FormGroup;
  const lignes = formGroup.get('lignesEcriture') as FormArray;
  
  if (!lignes || lignes.length === 0) return null;

  let totalDebit = 0;
  let totalCredit = 0;

  for (let ligne of lignes.controls) {
    totalDebit += Number(ligne.get('debit')?.value) || 0;
    totalCredit += Number(ligne.get('credit')?.value) || 0;
  }

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    return { desequilibre: true }; 
  }

  return null; 
}

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, IconComponent],
  templateUrl: './entry-from.html'
})
export class EntryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);

  comptes$!: Observable<CompteOHADA[]>;
  tenantId: string = 'tenant-1';

  totalDebit: number = 0;
  totalCredit: number = 0;
  isBalanced: boolean = true;

  @Output() save = new EventEmitter<Ecriture>();

  entryForm = this.fb.group({
    libelle: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    lignesEcriture: this.fb.array([], Validators.minLength(2))
  }, { validators: partieDoubleValidator });

  get lignesEcriture(): FormArray {
    return this.entryForm.get('lignesEcriture') as FormArray;
  }

  ngOnInit() {
    const urlTenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (urlTenantId) {
      this.tenantId = urlTenantId;
    }

    this.comptes$ = this.accountService.getAccounts(this.tenantId);

    this.entryForm.valueChanges.pipe(
      startWith(this.entryForm.value)
    ).subscribe(value => {
      this.calculateTotals(value.lignesEcriture);
    });

    if (this.lignesEcriture.length === 0) {
      this.addLigne();
      this.addLigne();
    }
  }

  calculateTotals(lignes: any[] | undefined) {
    if (!lignes) return;
    
    this.totalDebit = lignes.reduce((sum, current) => sum + (Number(current.debit) || 0), 0);
    this.totalCredit = lignes.reduce((sum, current) => sum + (Number(current.credit) || 0), 0);
    this.isBalanced = Math.abs(this.totalDebit - this.totalCredit) < 0.001;
  }

  addLigne() {
    const ligneForm = this.fb.group({
      compte: ['', Validators.required],
      debit: [0, [Validators.min(0)]],
      credit: [0, [Validators.min(0)]]
    });
    this.lignesEcriture.push(ligneForm);
  }

  removeLigne(index: number) {
    this.lignesEcriture.removeAt(index);
  }

  onSubmit() {
    if (this.entryForm.valid && this.isBalanced && this.lignesEcriture.length >= 2) {
      const formValue = this.entryForm.value;

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

      this.save.emit(ecriture);
      
      this.entryForm.reset({
        date: formValue.date,
        libelle: ''
      });
      
      while (this.lignesEcriture.length !== 0) {
        this.lignesEcriture.removeAt(0);
      }
      this.addLigne();
      this.addLigne();

      this.calculateTotals([]);
    } else {
      this.entryForm.markAllAsTouched();
    }
  }
}
