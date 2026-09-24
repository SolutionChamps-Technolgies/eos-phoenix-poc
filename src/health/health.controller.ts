import { Controller, Get } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
  service: 'eos-phoenix-poc';
}

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'eos-phoenix-poc',
    };
  }
}
