import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  const employees = [
    new EmployeeResponseDto({
      id: 'phx-emp-001',
      displayName: 'Mira Calder',
      jobTitle: 'Platform Engineer',
      department: 'Engineering',
      status: 'active',
    }),
  ];

  let controller: EmployeesController;
  const listEmployees = jest.fn<EmployeeResponseDto[], []>().mockReturnValue(employees);

  beforeEach(async () => {
    listEmployees.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: { listEmployees },
        },
      ],
    }).compile();

    controller = module.get(EmployeesController);
  });

  it('returns the employees provided by the service', () => {
    expect(controller.listEmployees()).toEqual(employees);
    expect(listEmployees).toHaveBeenCalledTimes(1);
  });
});
