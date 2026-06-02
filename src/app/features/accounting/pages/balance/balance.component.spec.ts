import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BalanceComponent } from './balance.component';
import { BalanceService } from '../../services/balance.service';
import {  TableComponent  } from '@shared';
import {  TenantContextService  } from '@core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import {  environment  } from '@env/environment';
import { Component, Input } from '@angular/core';

// Mock du SpinnerComponent qui appelle l'icône
@Component({
  selector: 'app-spinner',
  standalone: true,
  template: ''
})
class MockSpinnerComponent {
  @Input() message: string = '';
}

// Mock du TableComponent pour éviter les dépendances
@Component({
  selector: 'app-table',
  standalone: true,
  template: ''
})
class MockTableComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() isLoading: boolean = false;
}

describe('BalanceComponent (Intégration)', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;
  let httpMock: HttpTestingController;

  let mockTenantContext: Partial<TenantContextService>;

  beforeEach(async () => {
    mockTenantContext = {
      companyId$: of('ENT-001'),
      companyName$: of('Tech Africa Cameroun')
    };

    await TestBed.configureTestingModule({
      imports: [BalanceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BalanceService,
        { provide: TenantContextService, useValue: mockTenantContext }
      ]
    })
    .overrideComponent(BalanceComponent, {
      remove: { imports: [TableComponent] },
      add: { imports: [MockSpinnerComponent, MockTableComponent] }
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait charger et afficher les données de balance', async () => {
    // Déclencher ngOnInit qui appelle loadBalance()
    fixture.detectChanges();

    // 1. Intercepter la requête vers l'API des comptes
    const reqComptes = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/comptes`));
    expect(reqComptes.request.method).toBe('GET');
    reqComptes.flush([]); // Répondre avec un tableau vide de comptes
    
    // Attendre que le switchMap se propage
    await new Promise(resolve => setTimeout(resolve));

    // 2. Intercepter la requête vers l'API des écritures (déclenchée par le switchMap dans BalanceService)
    const reqEcritures = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/ecritures`));
    expect(reqEcritures.request.method).toBe('GET');
    reqEcritures.flush([]); // Répondre avec un tableau vide d'écritures

    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
  });
});
