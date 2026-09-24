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

  it('returns the fixed synthetic Phoenix employees', () => {
    expect(repository.findAll()).toEqual(expectedEmployees);
  });

  it('returns copies so callers cannot change the stored records', () => {
    const firstRead = repository.findAll();
    firstRead[0].displayName = 'Changed Name';

    expect(repository.findAll()[0].displayName).toBe('Mira Calder');
  });
});
