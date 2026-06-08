import { Controller, Get } from '@nestjs/common';
import { UsStateCoverage } from '../../domain/us-state';
import { CoverageService } from './coverage.service';

@Controller('/coverage')
export class CoverageController {
  constructor(private readonly coverageService: CoverageService) {}

  @Get('/states')
  listStates(): readonly UsStateCoverage[] {
    return this.coverageService.listStateCoverages();
  }
}
