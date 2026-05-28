import { TestBed } from '@angular/core/testing';
import { JournalService } from './journal.service';
import { Ecriture, JournalFilter } from '../../../core/models/ecriture.model';

describe('JournalService', () => {
  let service: JournalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getJournal', () => {
    it('should return all entries for a company', (done) => {
      service.getJournal('tenant-1').subscribe(entries => {
        expect(entries.length).toBeGreaterThan(0);
        expect(entries.every(e => e.entrepriseId === 'tenant-1')).toBe(true);
        done();
      });
    });

    it('should return empty array for non-existent company', (done) => {
      service.getJournal('non-existent').subscribe(entries => {
        expect(entries.length).toBe(0);
        done();
      });
    });
  });

  describe('getJournalFiltered', () => {
    it('should filter entries by journal type', (done) => {
      const filter: JournalFilter = { journalId: 'ACH' };
      service.getJournalFiltered('tenant-1', filter).subscribe(entries => {
        expect(entries.every(e => e.journalId === 'ACH')).toBe(true);
        done();
      });
    });

    it('should filter entries by date range', (done) => {
      const filter: JournalFilter = {
        dateDebut: '2024-01-15',
        dateFin: '2024-01-20'
      };
      service.getJournalFiltered('tenant-1', filter).subscribe(entries => {
        expect(entries.every(e =>
          e.date >= filter.dateDebut! && e.date <= filter.dateFin!
        )).toBe(true);
        done();
      });
    });

    it('should return only validated entries when flag is set', (done) => {
      const filter: JournalFilter = { valideOnly: true };
      service.getJournalFiltered('tenant-1', filter).subscribe(entries => {
        expect(entries.every(e => e.valide)).toBe(true);
        done();
      });
    });

    it('should search by libelle', (done) => {
      const filter: JournalFilter = { searchTerm: 'Achat' };
      service.getJournalFiltered('tenant-1', filter).subscribe(entries => {
        expect(entries.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('getJournalStats', () => {
    it('should calculate correct totals', (done) => {
      service.getJournalStats('tenant-1').subscribe(stats => {
        expect(stats.totalEntries).toBeGreaterThan(0);
        expect(stats.totalDebit).toBeGreaterThan(0);
        expect(stats.totalCredit).toBeGreaterThan(0);
        done();
      });
    });

    it('should verify balance', (done) => {
      service.getJournalStats('tenant-1').subscribe(stats => {
        expect(stats.isBalanced).toBe(true);
        done();
      });
    });
  });
});
