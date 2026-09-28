import { Controller, Get, Query } from '@nestjs/common';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  listEmployees(@Query('name') name?: string): EmployeeResponseDto[] {
    if (name !== undefined) {
      return this.employeesService.searchEmployees(name);
    }
    return this.employeesService.listEmployees();
  }
}
