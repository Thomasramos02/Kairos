import { Injectable, Inject } from '@nestjs/common';
import { BusinessesQueryService } from '../businesses/businesses-query.service';
import { ListBusinessesQuery } from '../businesses/dto/list-businesses.dto';
import { CsvExportResponse, CsvExportRow } from './models/export.model';
import { buildBusinessesCsv } from './services/csv-export.builder';
import { DrizzleDatabase } from '../../database/drizzle.provider';
import { DRIZZLE_DATABASE } from '../../database/database.tokens';
import { businesses } from '../../database/schema/businesses';
import { watchlistItems } from '../../database/schema/watchlist-items';
import { timingScores } from '../../database/schema/timing-scores';
import { eq } from 'drizzle-orm';

@Injectable()
export class ExportsService {
  constructor(
    private readonly businessesQueryService: BusinessesQueryService,
    @Inject(DRIZZLE_DATABASE) private readonly db: DrizzleDatabase,
  ) {}

  async exportBusinessesCsv(query: ListBusinessesQuery): Promise<CsvExportResponse> {
    const businesses = await this.businessesQueryService.listNewBusinesses(query);
    const csvRows = businesses.map((business): CsvExportRow => ({
      id: business.id,
      sourceDocumentNumber: business.sourceDocumentNumber,
      companyName: business.name,
      registeredAt: business.registeredAt,
      ageDays: business.ageDays,
      state: business.state,
      city: business.city,
      industry: business.industry,
      timingStage: business.timingStage,
      timingScore: business.timingScore,
      source: business.source,
      recommendationStrength: business.recommendationStrength,
      reason: business.reason,
      signalsCount: business.signalsCount,
    }));

    return {
      fileName: 'kairos-businesses.csv',
      contentType: 'text/csv',
      csv: buildBusinessesCsv(csvRows),
    };
  }

  async exportWatchlistCsv(accountId: string): Promise<CsvExportResponse> {
    const watchlistBusinesses = await this.db
      .select({
        id: businesses.id,
        sourceDocumentNumber: businesses.sourceDocumentNumber,
        companyName: businesses.legalName,
        registeredAt: businesses.registeredAt,
        state: businesses.state,
        city: businesses.city,
        industry: businesses.industry,
        source: businesses.sourceName,
        timingStage: timingScores.timingStage,
        timingScore: timingScores.timingScore,
        recommendationStrength: timingScores.timingRank, // Mapping timingRank to recommendationStrength
        reason: timingScores.reason,
        signalsCount: timingScores.signalsCount,
      })
      .from(watchlistItems)
      .innerJoin(businesses, eq(watchlistItems.businessId, businesses.id))
      .leftJoin(timingScores, eq(businesses.id, timingScores.businessId))
      .where(eq(watchlistItems.accountId, accountId));

    const csvRows = watchlistBusinesses.map((business): CsvExportRow => {
      const registeredAtDate = new Date(business.registeredAt);
      const ageDays = Math.floor((Date.now() - registeredAtDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: business.id,
        sourceDocumentNumber: business.sourceDocumentNumber ?? '',
        companyName: business.companyName ?? '',
        registeredAt: registeredAtDate.toISOString(),
        ageDays: ageDays,
        state: business.state ?? '',
        city: business.city ?? '',
        industry: business.industry ?? '',
        timingStage: business.timingStage ?? 'unknown',
        timingScore: business.timingScore ?? 0,
        source: business.source ?? '',
        recommendationStrength: (business.recommendationStrength ?? 0).toString(),
        reason: business.reason ?? '',
        signalsCount: business.signalsCount ?? 0,
      };
    });

    return {
      fileName: 'kairos-watchlist.csv',
      contentType: 'text/csv',
      csv: buildBusinessesCsv(csvRows),
    };
  }
}
