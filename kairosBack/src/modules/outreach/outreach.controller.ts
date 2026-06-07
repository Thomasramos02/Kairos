import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  OutreachSuggestion,
  OutreachSuggestionRequest,
} from './models/outreach.model';
import { OutreachService } from './outreach.service';

@Controller('/outreach')
@UseGuards(JwtAuthGuard)
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Post('/suggestion')
  createSuggestion(@Body() request: OutreachSuggestionRequest): OutreachSuggestion {
    return this.outreachService.createSuggestion(request);
  }
}
