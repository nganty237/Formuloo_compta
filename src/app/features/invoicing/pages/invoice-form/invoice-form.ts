import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-form.html'
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  invoiceForm = this.fb.group({
    montantHT: [0],
    tva: [18], 
    montantTTC: [0]
  });

  ngOnInit() {
    // On écoute en temps réel chaque frappe sur le champ montantHT
    this.invoiceForm.get('montantHT')?.valueChanges.subscribe((ht) => {
      const montantHT = ht || 0;
      const tauxTVA = this.invoiceForm.get('tva')?.value || 18;
      
      const montantTVA = montantHT * (tauxTVA / 100);
      const ttc = montantHT + montantTVA;

      // patchValue modifie le formulaire. 
      // L'option emitEvent: false est VITALE ici pour éviter une boucle infinie de changements !
      this.invoiceForm.patchValue({
        montantTTC: ttc
      }, { emitEvent: false });
    });
  }
}