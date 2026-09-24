import { Controller, Get } from '@nestjs/common';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  listEmployees(): EmployeeResponseDto[] {
    return this.employeesService.listEmployees();
  }
}
