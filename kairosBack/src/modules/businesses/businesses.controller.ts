import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IndustryEnrichmentQuery } from './dto/industry-enrichment.dto';
import { ListBusinessesPageQuery } from './dto/list-businesses.dto';
import { CorporateIndustryEnrichmentService } from './enrichment/corporate-industry-enrichment.service';
import { BusinessesQueryService } from './businesses-query.service';
import {
  BusinessListItem,
  PaginatedBusinessList,
} from './models/business-list.model';
import { CorporateIndustryEnrichment } from './enrichment/corporate-industry-enrichment.model';

@Controller('/businesses')
@UseGuards(JwtAuthGuard)
export class BusinessesController {
  constructor(
    private readonly businessesQueryService: BusinessesQueryService,
    private readonly enrichmentService: CorporateIndustryEnrichmentService,
  ) {}

  @Get('industry-enrichment')
  async enrichIndustryByCompanyId(
    @Query() query: IndustryEnrichmentQuery,
  ): Promise<CorporateIndustryEnrichment> {
    return await this.enrichmentService.enrichByCompanyId(query);
  }

  @Get(':businessId')
  async getBusinessById(
    @Param('businessId') businessId: string,
    @Query() query: Pick<ListBusinessesPageQuery, 'offeredService'>,
  ): Promise<BusinessListItem> {
    return await this.businessesQueryService.getBusinessById(businessId, query);
  }

  @Get()
  async listNewBusinesses(
    @Query() query: ListBusinessesPageQuery,
  ): Promise<PaginatedBusinessList> {
    return await this.businessesQueryService.listNewBusinessesPage(query);
  }
}
