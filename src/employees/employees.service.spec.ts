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
  const findByName = jest.fn<Employee[], [string]>().mockReturnValue([storedEmployee]);

  beforeEach(async () => {
    findAll.mockClear();
    findByName.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: EmployeesRepository,
          useValue: { findAll, findByName },
        },
      ],
    }).compile();

    service = module.get(EmployeesService);
  });

  describe('listEmployees', () => {
    it('maps repository records to response DTOs', () => {
      const employees = service.listEmployees();

      expect(findAll).toHaveBeenCalledTimes(1);
      expect(employees).toEqual([new EmployeeResponseDto(storedEmployee)]);
      expect(employees[0]).toBeInstanceOf(EmployeeResponseDto);
    });
  });

  describe('searchEmployees', () => {
    it('delegates to findByName and maps results to response DTOs', () => {
      const employees = service.searchEmployees('Mira');

      expect(findByName).toHaveBeenCalledWith('Mira');
      expect(findByName).toHaveBeenCalledTimes(1);
      expect(employees).toEqual([new EmployeeResponseDto(storedEmployee)]);
      expect(employees[0]).toBeInstanceOf(EmployeeResponseDto);
    });

    it('returns [] when findByName returns no records', () => {
      findByName.mockReturnValueOnce([]);

      expect(service.searchEmployees('zzz-no-match')).toEqual([]);
    });
  });
});
