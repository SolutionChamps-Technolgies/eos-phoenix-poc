export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: string;
  displayName: string;
  jobTitle: string;
  department: string;
  status: EmployeeStatus;
}
