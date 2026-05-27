import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './invoice-form.html'
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  @Output() save = new EventEmitter<any>();
  isModalOpen = false;

  clients = [
    { id: 'CLI-001', compte: '411100', nom: 'Entreprise Alpha SARL' },
    { id: 'CLI-002', compte: '411200', nom: 'Consulting Beta' }
  ];

  comptesProduit = [
    { id: '701000', intitule: 'Ventes de marchandises' },
    { id: '706000', intitule: 'Services vendus' }
  ];

  invoiceForm = this.fb.group({
    clientId: ['', Validators.required],
    compteProduitId: ['', Validators.required],
    montantHT: [0, [Validators.required, Validators.min(1)]],
    tauxTVA: [18, [Validators.required, Validators.min(0)]],
    montantTVA: [{ value: 0, disabled: true }], 
    montantTTC: [{ value: 0, disabled: true }]  
  });

  ngOnInit() {
    this.invoiceForm.valueChanges.subscribe(() => {
      const ht = this.invoiceForm.get('montantHT')?.value || 0;
      const taux = this.invoiceForm.get('tauxTVA')?.value || 0;

      const tva = ht * (taux / 100);
      const ttc = ht + tva;

      // emitEvent: false est OBLIGATOIRE pour éviter une boucle infinie de modifications
      this.invoiceForm.patchValue({
        montantTVA: tva,
        montantTTC: ttc
      }, { emitEvent: false });
    });
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      this.isModalOpen = true;
    } else {
      this.invoiceForm.markAllAsTouched();
    }
  }

  confirmValidation() {
    this.isModalOpen = false;
    // getRawValue() permet d'extraire les données, y compris celles des champs "disabled" (TVA, TTC)
    this.save.emit(this.invoiceForm.getRawValue());
    this.invoiceForm.reset({
      montantHT: 0,
      tauxTVA: 18,
      clientId: '',
      compteProduitId: ''
    });
  }
}