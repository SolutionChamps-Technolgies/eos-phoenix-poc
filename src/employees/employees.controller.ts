import { Controller, Get, Query } from '@nestjs/common';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeeSearchQueryDto } from './dto/employee-search-query.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  listEmployees(@Query() query: EmployeeSearchQueryDto): EmployeeResponseDto[] {
    if (query.name !== undefined) {
      return this.employeesService.searchEmployees(query.name);
    }
    return this.employeesService.listEmployees();
  }
}
