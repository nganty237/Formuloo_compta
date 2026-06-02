import { Component, DestroyRef, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate } from '@angular/animations';
import { ModalComponent, ButtonComponent, IconComponent } from '@shared';
import { TenantContextService, Facture } from '@core';
import { InvoicingService } from '../../services/invoicing.service';

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

export type InvoiceFormData = Omit<Facture, 'id'>;

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ButtonComponent, IconComponent, RouterLink],
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
  private invoicingService = inject(InvoicingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
    type: ['FACTURE', Validators.required],
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

    const formValue = this.invoiceForm.getRawValue();

    const formData: InvoiceFormData = {
      entrepriseId: this.selectedCompanyId,
      clientId: this.selectedCompanyId,
      numero: this.generateInvoiceNumber(formValue.type as any),
      type: formValue.type as any,
      date: new Date().toISOString().split('T')[0],
      statut: 'BROUILLON',
      montantHt: formValue.montantHT ?? 0,
      tva: formValue.montantTVA ?? 0,
      montantTtc: formValue.montantTTC ?? 0,
      compteProduitId: formValue.compteProduitId ?? undefined,
      description: formValue.description ?? undefined
    };

    this.invoicingService.create(formData).subscribe(() => {
        this.save.emit(formData);
        this.resetForm();
        this.router.navigate(['../list'], { relativeTo: this.route });
    });
  }

  resetForm(): void {
    this.invoiceForm.reset({
      type: 'FACTURE',
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

  private generateInvoiceNumber(type: 'DEVIS' | 'FACTURE' | 'AVOIR'): string {
    const prefix = type === 'DEVIS' ? 'DEV' : (type === 'AVOIR' ? 'AVR' : 'FAC');
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(5, '0');
    return `${prefix}-${year}${month}-${random}`;
  }

  getClientName(): string {
    return this.selectedCompanyName || 'Aucun dossier sélectionné';
  }

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
