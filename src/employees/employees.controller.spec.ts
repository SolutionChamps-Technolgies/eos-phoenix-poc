import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  const allEmployees = [
    new EmployeeResponseDto({
      id: 'phx-emp-001',
      displayName: 'Mira Calder',
      jobTitle: 'Platform Engineer',
      department: 'Engineering',
      status: 'active',
    }),
    new EmployeeResponseDto({
      id: 'phx-emp-002',
      displayName: 'Jonah Hale',
      jobTitle: 'Delivery Analyst',
      department: 'Delivery',
      status: 'active',
    }),
  ];

  const matchedEmployees = [allEmployees[0]];

  let controller: EmployeesController;
  const listEmployees = jest.fn<EmployeeResponseDto[], []>().mockReturnValue(allEmployees);
  const searchEmployees = jest
    .fn<EmployeeResponseDto[], [string]>()
    .mockReturnValue(matchedEmployees);

  beforeEach(async () => {
    listEmployees.mockClear();
    searchEmployees.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: { listEmployees, searchEmployees },
        },
      ],
    }).compile();

    controller = module.get(EmployeesController);
  });

  describe('GET /employees (no name param)', () => {
    it('calls listEmployees and returns the full list', () => {
      expect(controller.listEmployees({})).toEqual(allEmployees);
      expect(listEmployees).toHaveBeenCalledTimes(1);
      expect(searchEmployees).not.toHaveBeenCalled();
    });
  });

  describe('GET /employees?name=...', () => {
    it('calls searchEmployees with the name and returns matched results', () => {
      expect(controller.listEmployees({ name: 'Mira' })).toEqual(matchedEmployees);
      expect(searchEmployees).toHaveBeenCalledWith('Mira');
      expect(searchEmployees).toHaveBeenCalledTimes(1);
      expect(listEmployees).not.toHaveBeenCalled();
    });

    it('returns [] when searchEmployees yields no matches', () => {
      searchEmployees.mockReturnValueOnce([]);

      expect(controller.listEmployees({ name: 'zzz-no-match' })).toEqual([]);
    });
  });
});
