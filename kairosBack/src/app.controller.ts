import { Controller, Get } from '@nestjs/common';

type HealthResponse = {
  readonly service: 'kairos-back';
  readonly status: 'ok';
};

@Controller()
export class AppController {
  @Get('/health')
  getHealth(): HealthResponse {
    return {
      service: 'kairos-back',
      status: 'ok',
    };
  }
}
