import { Injectable } from '@nestjs/common';
import {
  OutreachSuggestion,
  OutreachSuggestionRequest,
} from './models/outreach.model';
import { buildOutreachMessage } from './services/outreach-message.builder';

@Injectable()
export class OutreachService {
  createSuggestion(request: OutreachSuggestionRequest): OutreachSuggestion {
    return { message: buildOutreachMessage(request) };
  }
}
