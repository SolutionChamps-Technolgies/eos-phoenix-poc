import { IsOptional, IsString } from 'class-validator';

export class EmployeeSearchQueryDto {
  @IsOptional()
  @IsString()
  name?: string;
}
