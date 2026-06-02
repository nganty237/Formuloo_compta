import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { tenantInterceptor } from './tenant-interceptor';
import { TenantContextService } from '../services/tenant-context.service';

describe('tenantInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let tenantContext: TenantContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tenantInterceptor])),
        provideHttpClientTesting(),
        TenantContextService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tenantContext = TestBed.inject(TenantContextService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add X-Tenant-Id and X-Company-Id headers when context is set', () => {
    tenantContext.selectCompany('ENT-001', 'Test Company', 'tenant-1');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-1');
    expect(req.request.headers.get('X-Company-Id')).toBe('ENT-001');
  });

  it('should not add headers when context is empty', () => {
    tenantContext.clear();

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('X-Tenant-Id')).toBe(false);
    expect(req.request.headers.has('X-Company-Id')).toBe(false);
  });
});
