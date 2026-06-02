import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { JournalService } from '../../services/journal.service';
import { firstValueFrom } from 'rxjs';
import {  Ecriture  } from '@core';

describe('Performance & Load Testing (Basics)', () => {
  let httpMock: HttpTestingController;
  let journalService: JournalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        JournalService
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    journalService = TestBed.inject(JournalService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait supporter 50 requêtes simultanées de lecture du journal', async () => {
    const startTime = performance.now();
    const NB_USERS = 50;
    const mockData: Ecriture[] = Array(10).fill({ id: '1', libelle: 'Test', lignes: [] });

    // Simuler 50 utilisateurs qui demandent le journal en même temps
    const requests = Array(NB_USERS).fill(null).map(() => 
      firstValueFrom(journalService.getJournal('ENT-001'))
    );

    // Intercepter les 50 appels
    const reqs = httpMock.match(req => req.url.includes('/ecritures'));
    expect(reqs.length).toBe(NB_USERS);
    
    // Répondre à tous
    reqs.forEach(req => req.flush(mockData));

    await Promise.all(requests);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    console.log(`Temps de réponse pour ${NB_USERS} requêtes simulées : ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(1000); 
  });

  it('devrait maintenir l\'intégrité lors de créations massives', async () => {
    const NB_CREATIONS = 20;
    const creations = [];

    for (let i = 0; i < NB_CREATIONS; i++) {
      const entry: Ecriture = {
        id: `stress-${i}`,
        entrepriseId: 'ENT-001',
        journalId: 'OD',
        date: '2024-02-01',
        libelle: `Stress entry ${i}`,
        valide: true,
        lignes: []
      };
      creations.push(firstValueFrom(journalService.create(entry)));
    }

    const reqs = httpMock.match({ method: 'POST' });
    expect(reqs.length).toBe(NB_CREATIONS);

    reqs.forEach((req, idx) => req.flush({ id: `stress-${idx}`, libelle: `Stress entry ${idx}` }));

    const results = await Promise.all(creations) as any[];
    expect(results.length).toBe(NB_CREATIONS);
    expect(results[NB_CREATIONS - 1].libelle).toBe(`Stress entry ${NB_CREATIONS - 1}`);
  });
});
