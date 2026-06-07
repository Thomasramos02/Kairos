import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListBusinessesQuery } from '../businesses/dto/list-businesses.dto';
import { ExportsService } from './exports.service';
import { CsvExportResponse } from './models/export.model';

@Controller()
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('exports/businesses.csv')
  async exportBusinessesCsv(
    @Query() query: ListBusinessesQuery,
  ): Promise<CsvExportResponse> {
    return await this.exportsService.exportBusinessesCsv(query);
  }

  @Get('accounts/:accountId/watchlist/export.csv')
  async exportWatchlistCsv(
    @Param('accountId') accountId: string,
  ): Promise<CsvExportResponse> {
    return await this.exportsService.exportWatchlistCsv(accountId);
  }
}