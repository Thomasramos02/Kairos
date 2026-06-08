import { Injectable } from '@nestjs/common';
import { usStateCoverages, UsStateCoverage } from '../../domain/us-state';

@Injectable()
export class CoverageService {
  listStateCoverages(): readonly UsStateCoverage[] {
    return usStateCoverages;
  }
}
