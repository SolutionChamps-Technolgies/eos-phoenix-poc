import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule, EmployeesModule],
})
export class AppModule {}
