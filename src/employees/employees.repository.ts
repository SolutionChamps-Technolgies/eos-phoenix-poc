import { Injectable } from '@nestjs/common';
import { Employee } from './employee';

const PHOENIX_EMPLOYEES: readonly Employee[] = [
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

@Injectable()
export class EmployeesRepository {
  findAll(): Employee[] {
    return PHOENIX_EMPLOYEES.map((employee) => ({ ...employee }));
  }

  findByName(name: string): Employee[] {
    const needle = name.trim().toLowerCase();
    return PHOENIX_EMPLOYEES.filter((employee) =>
      employee.displayName.toLowerCase().includes(needle),
    ).map((employee) => ({ ...employee }));
  }
}
