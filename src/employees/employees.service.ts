import { Injectable } from '@nestjs/common';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeesRepository } from './employees.repository';

@Injectable()
export class EmployeesService {
  constructor(private readonly employeesRepository: EmployeesRepository) {}

  listEmployees(): EmployeeResponseDto[] {
    return this.employeesRepository
      .findAll()
      .map((employee) => new EmployeeResponseDto(employee));
  }

  searchEmployees(name: string): EmployeeResponseDto[] {
    return this.employeesRepository
      .findByName(name)
      .map((employee) => new EmployeeResponseDto(employee));
  }
}
