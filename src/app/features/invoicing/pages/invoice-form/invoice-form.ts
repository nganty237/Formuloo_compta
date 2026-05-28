import { Component, DestroyRef, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate } from '@angular/animations';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

function validInvoiceAmountsValidator(control: AbstractControl): ValidationErrors | null {
  const ht = control.get('montantHT')?.value;
  const taux = control.get('tauxTVA')?.value;

  if (ht && ht <= 0) {
    control.get('montantHT')?.setErrors({ positiveRequired: true });
  }
  
  if (taux !== undefined && taux !== null && taux < 0) {
    control.get('tauxTVA')?.setErrors({ negativeNotAllowed: true });
  }

  return null;
}

interface InvoiceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface InvoiceFormData {
  compteProduitId: string | null;
  montantHT: number | null;
  tauxTVA: number | null;
  montantTVA: number | null;
  montantTTC: number | null;
  description: string | null;
  clientId: string;
  clientName: string;
  numeroFacture: string;
  dateCreation: string;
  statut: 'brouillon';
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ButtonComponent, IconComponent],
  templateUrl: './invoice-form.html',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class InvoiceFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private tenantContext = inject(TenantContextService);
  
  @Output() save = new EventEmitter<InvoiceFormData>();
  
  isModalOpen = false;
  validationErrors: string[] = [];
  validationWarnings: string[] = [];
  selectedCompanyId = '';
  selectedCompanyName = '';

  comptesProduit = [
    { id: '701000', intitule: 'Ventes de marchandises' },
    { id: '706000', intitule: 'Services vendus' }
  ];

  tauxTVAParPays = {
    'CI': 18,
    'SN': 18,
    'BF': 18,
    'TG': 18
  };

  invoiceForm = this.fb.group({
    compteProduitId: ['', Validators.required],
    montantHT: [0, [Validators.required, Validators.min(0.01)]],
    tauxTVA: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
    montantTVA: [{ value: 0, disabled: true }],
    montantTTC: [{ value: 0, disabled: true }],
    description: ['', [Validators.maxLength(500)]]
  }, { validators: validInvoiceAmountsValidator });

  ngOnInit() {
    this.tenantContext.companyId$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(companyId => {
      this.selectedCompanyId = companyId ?? '';
    });

    this.tenantContext.companyName$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(companyName => {
      this.selectedCompanyName = companyName ?? '';
    });

    this.invoiceForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.updateInvoiceAmounts();
    });

    this.updateInvoiceAmounts();
  }

  private updateInvoiceAmounts(): void {
    const ht = this.invoiceForm.get('montantHT')?.value || 0;
    const taux = this.invoiceForm.get('tauxTVA')?.value || 0;

    const tva = ht * (taux / 100);
    const ttc = ht + tva;

    this.invoiceForm.patchValue({
      montantTVA: parseFloat(tva.toFixed(2)),
      montantTTC: parseFloat(ttc.toFixed(2))
    }, { emitEvent: false });
  }

  /**
   * Valide la facture avant soumission
   */
  private validateInvoice(): InvoiceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const compte = this.invoiceForm.get('compteProduitId')?.value;
    const ht = this.invoiceForm.get('montantHT')?.value;
    const tva = this.invoiceForm.get('montantTVA')?.value;
    const ttc = this.invoiceForm.get('montantTTC')?.value;

    if (!this.selectedCompanyId) errors.push('Aucun dossier actif n\'est sélectionné');
    if (!compte) errors.push('Le compte produit est obligatoire');
    if (!ht || ht <= 0) errors.push('Le montant HT doit être > 0');
    if (ttc && ttc < 100) warnings.push('Montant très faible : vérifiez le montant HT');
    
    if (ht && ttc) {
      const ratio = ttc / ht;
      if (ratio < 1) {
        errors.push('Le montant TTC est inférieur au montant HT (vérifiez le taux de TVA)');
      }
    }

    if (tva && !Number.isInteger(tva * 100)) {
      warnings.push('Arrondi TVA détecté : vérifiez le calcul');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    const validation = this.validateInvoice();
    this.validationErrors = validation.errors;
    this.validationWarnings = validation.warnings;

    if (!validation.isValid) {
      return;
    }

    this.isModalOpen = true;
  }

  confirmValidation(): void {
    this.isModalOpen = false;
    
    const formData: InvoiceFormData = {
      ...this.invoiceForm.getRawValue(),
      clientId: this.selectedCompanyId,
      clientName: this.selectedCompanyName,
      numeroFacture: this.generateInvoiceNumber(),
      dateCreation: new Date().toISOString().split('T')[0],
      statut: 'brouillon'
    };

    this.save.emit(formData);
    this.resetForm();
  }

  resetForm(): void {
    this.invoiceForm.reset({
      montantHT: 0,
      tauxTVA: 18,
      compteProduitId: '',
      description: '',
      montantTVA: 0,
      montantTTC: 0
    });
    this.validationErrors = [];
    this.validationWarnings = [];
  }

  /**
   * Génère un numéro de facture unique
   */
  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(5, '0');
    return `FAC-${year}${month}-${random}`;
  }

  getClientName(): string {
    return this.selectedCompanyName || 'Aucun dossier sélectionné';
  }

  /**
   * Obtient le montant total (pour affichage)
   */
  getMonthlyTotal(): number {
    const ttc = this.invoiceForm.get('montantTTC')?.value || 0;
    return ttc;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.invoiceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.invoiceForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['min']) return 'La valeur minimum n\'est pas atteinte';
    if (field.errors['max']) return 'La valeur dépasse le maximum autorisé';
    if (field.errors['positiveRequired']) return 'Le montant doit être positif';
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;

    return 'Erreur de saisie';
  }
}
