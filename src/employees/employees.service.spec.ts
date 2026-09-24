import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { Employee } from './employee';
import { EmployeesRepository } from './employees.repository';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  const storedEmployee: Employee = {
    id: 'phx-emp-001',
    displayName: 'Mira Calder',
    jobTitle: 'Platform Engineer',
    department: 'Engineering',
    status: 'active',
  };

  let service: EmployeesService;
  const findAll = jest.fn<Employee[], []>().mockReturnValue([storedEmployee]);

  beforeEach(async () => {
    findAll.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: EmployeesRepository,
          useValue: { findAll },
        },
      ],
    }).compile();

    service = module.get(EmployeesService);
  });

  it('maps repository records to response DTOs', () => {
    const employees = service.listEmployees();

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(employees).toEqual([new EmployeeResponseDto(storedEmployee)]);
    expect(employees[0]).toBeInstanceOf(EmployeeResponseDto);
  });
});
