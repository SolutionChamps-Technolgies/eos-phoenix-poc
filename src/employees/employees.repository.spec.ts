import { Employee } from './employee';
import { EmployeesRepository } from './employees.repository';

const expectedEmployees: Employee[] = [
  {
    id: 'phx-emp-001',
    displayName: 'Mira Calder',
    jobTitle: 'Platform Engineer',
    department: 'Engineering',
    status: 'active',
  },
  {
    id: 'phx-emp-002',
    displayName: 'Jonah Hale',
    jobTitle: 'Delivery Analyst',
    department: 'Delivery',
    status: 'active',
  },
  {
    id: 'phx-emp-003',
    displayName: 'Sera Quinn',
    jobTitle: 'Quality Specialist',
    department: 'Quality',
    status: 'inactive',
  },
  {
    id: 'phx-emp-004',
    displayName: 'Ellis Rowan',
    jobTitle: 'Evidence Coordinator',
    department: 'Operations',
    status: 'active',
  },
];

describe('EmployeesRepository', () => {
  const repository = new EmployeesRepository();

  describe('findAll', () => {
    it('returns the fixed synthetic Phoenix employees', () => {
      expect(repository.findAll()).toEqual(expectedEmployees);
    });

    it('returns copies so callers cannot change the stored records', () => {
      const firstRead = repository.findAll();
      firstRead[0].displayName = 'Changed Name';

      expect(repository.findAll()[0].displayName).toBe('Mira Calder');
    });
  });

  describe('findByName', () => {
    it('returns employees whose displayName contains the search term', () => {
      const results = repository.findByName('Mira');

      expect(results).toEqual([expectedEmployees[0]]);
    });

    it('matches case-insensitively', () => {
      expect(repository.findByName('mira calder')).toEqual([expectedEmployees[0]]);
      expect(repository.findByName('JONAH')).toEqual([expectedEmployees[1]]);
    });

    it('trims surrounding whitespace before matching', () => {
      expect(repository.findByName('  Sera Quinn  ')).toEqual([expectedEmployees[2]]);
    });

    it('returns multiple employees when the term matches more than one', () => {
      // 'a' appears in all four display names
      const results = repository.findByName('a');

      expect(results.length).toBeGreaterThan(1);
    });

    it('returns [] when no employee matches', () => {
      expect(repository.findByName('zzz-no-match')).toEqual([]);
    });

    it('returns copies so callers cannot mutate stored records', () => {
      const results = repository.findByName('Ellis');
      results[0].displayName = 'Changed';

      expect(repository.findByName('Ellis')[0].displayName).toBe('Ellis Rowan');
    });
  });
});
