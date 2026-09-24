import { Employee, EmployeeStatus } from '../employee';

export class EmployeeResponseDto {
  readonly id: string;
  readonly displayName: string;
  readonly jobTitle: string;
  readonly department: string;
  readonly status: EmployeeStatus;

  constructor(employee: Employee) {
    this.id = employee.id;
    this.displayName = employee.displayName;
    this.jobTitle = employee.jobTitle;
    this.department = employee.department;
    this.status = employee.status;
  }
}
