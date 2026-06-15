import { OfferedService, requestKairosApi } from './account-api'
import { Company, CorporateIndustryEnrichment, TimingStage } from './types'

export type DigitalSignalName =
  | 'website-missing'
  | 'domain-recently-registered'
  | 'website-incomplete'
  | 'local-presence-incomplete'
  | 'social-presence-misaligned'
  | 'social-profile-detected'
  | 'online-store-recently-launched'
  | 'website-technology-detected'
  | 'business-contact-detected'

export type SocialNetworkName =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'twitter'
  | 'x'
  | 'youtube'

export type DigitalSignalSocialProfile = {
  readonly network: SocialNetworkName
  readonly url: string
}

export type BusinessContactMethod = {
  readonly type: 'phone' | 'email' | 'contact-form' | 'address' | 'agent' | 'officer' | 'license'
  readonly value: string
  readonly source: 'registry' | 'website' | 'license' | 'county-btr'
  readonly confidenceScore: number
  readonly label?: string
}

export type DigitalSignalMetadata = {
  readonly contactMethods?: readonly BusinessContactMethod[]
  readonly socialProfiles?: readonly DigitalSignalSocialProfile[]
  readonly technologies?: readonly string[]
  readonly websiteUrl?: string
}

export type BusinessDigitalSignalSummary = {
  readonly signalName: DigitalSignalName
  readonly sourceName: string
  readonly confidenceScore: number
  readonly metadata: DigitalSignalMetadata
  readonly serviceImpact: string
}

export type RecommendationStrength =
  | 'strong-match'
  | 'relevant'
  | 'monitor'
  | 'low-fit'

export type TimingScoreComponents = {
  readonly ageFitScore: number
  readonly dataConfidenceScore: number
  readonly digitalReadinessScore: number
  readonly industryFitScore: number
  readonly penaltyScore: number
  readonly serviceNeedScore: number
}

export type BusinessListItem = {
  readonly id: string
  readonly sourceDocumentNumber: string | null
  readonly name: string
  readonly registeredAt: string
  readonly ageDays: number
  readonly city: string | null
  readonly state: string
  readonly industry: string
  readonly source: string
  readonly signalsCount: number
  readonly digitalSignals: readonly BusinessDigitalSignalSummary[]
  readonly recommendationStrength: RecommendationStrength
  readonly scoreComponents: TimingScoreComponents
  readonly timingStage: TimingStage
  readonly timingScore: number
  readonly reason: string
}

export type BusinessListPage = {
  readonly items: readonly BusinessListItem[]
  readonly total: number
  readonly limit: number
  readonly offset: number
  readonly hasMore: boolean
}

export type ListBusinessesPageQuery = {
  readonly city?: string
  readonly industry?: string
  readonly limit?: number
  readonly minScore?: string
  readonly offset?: number
  readonly search?: string
  readonly state?: string
  readonly timingStage?: TimingStage | 'all'
  readonly offeredService?: OfferedService
  readonly opportunityFilters?: readonly string[]
}

export type DiscoverBusinessesPayload = {
  readonly state: string
  readonly industry: string
}

export type QueuedJobResponse = {
  readonly status: 'queued'
}

export type WatchlistItem = {
  readonly id: string
  readonly accountId: string
  readonly businessId: string
  readonly savedAt: string
}

export type TimingStageHistoryEntry = {
  readonly id: string
  readonly businessId: string
  readonly offeredService: OfferedService
  readonly previousStage: TimingStage | null
  readonly nextStage: TimingStage
  readonly timingScore: number
  readonly reason: string
  readonly changedAt: string
}

export type CsvExportResponse = {
  readonly fileName: string
  readonly contentType: 'text/csv'
  readonly csv: string
}

export type AlertReason = 'new-business' | 'entered-best-window' | 'timing-stage-changed'

export type AlertEvent = {
  readonly id: string
  readonly accountId: string
  readonly businessId: string
  readonly reason: AlertReason
  readonly channels: readonly ('email' | 'telegram')[]
  readonly readAt: string | null
  readonly createdAt: string
}

export type DashboardStats = {
  readonly newToday: number
  readonly enteringBestWindow: number
  readonly savedCompanies: number
  readonly avgReadiness: number
}

export type OutreachSuggestion = {
  readonly message: string
}

export type OutreachSuggestionPayload = {
  readonly businessName: string
  readonly offeredService: OfferedService
  readonly signalConfidenceScore?: number
  readonly signalImpact?: string
  readonly signalName: DigitalSignalName
  readonly timingReason?: string
  readonly timingStage: TimingStage
}

type CompanyDigitalSignal = NonNullable<Company['digitalSignals']>[number]

export async function listKairosBusinesses(
  query?: Pick<ListBusinessesPageQuery, 'offeredService'>,
): Promise<readonly BusinessListItem[]> {
  const response = await listKairosBusinessPage({
    limit: 1000,
    offset: 0,
    offeredService: query?.offeredService ?? 'website-design-development',
  })

  return response.items
}

export async function listKairosBusinessPage(
  query: ListBusinessesPageQuery,
): Promise<BusinessListPage> {
  return await requestKairosApi<BusinessListPage>(buildBusinessesPath(query), {
    method: 'GET',
  })
}

export async function getKairosBusiness(
  businessId: string,
  query?: Pick<ListBusinessesPageQuery, 'offeredService'>,
): Promise<BusinessListItem> {
  const detailPath = buildBusinessDetailPath(businessId, query?.offeredService)

  try {
    return await requestKairosApi<BusinessListItem>(detailPath, {
      method: 'GET',
    })
  } catch (error) {
    if (!isMissingBusinessDetailRoute(error)) {
      throw error
    }

    return await findKairosBusinessFromList(businessId, query)
  }
}

export async function enrichKairosIndustryByCompanyId(
  state: string,
  companyId: string,
): Promise<CorporateIndustryEnrichment> {
  return await requestKairosApi<CorporateIndustryEnrichment>(
    buildIndustryEnrichmentPath(state, companyId),
    {
      method: 'GET',
    },
  )
}

export async function saveKairosWatchlistItem(
  accountId: string,
  businessId: string,
): Promise<WatchlistItem> {
  return await requestKairosApi<WatchlistItem>(buildWatchlistCollectionPath(accountId), {
    body: { businessId },
    method: 'POST',
  })
}

export async function listKairosWatchlist(
  accountId: string,
): Promise<readonly WatchlistItem[]> {
  return await requestKairosApi<readonly WatchlistItem[]>(
    `/accounts/${accountId}/watchlist`,
    {
      method: 'GET',
    },
  )
}

export async function removeKairosWatchlistItem(
  accountId: string,
  businessId: string,
): Promise<WatchlistItem> {
  return await requestKairosApi<WatchlistItem>(
    buildWatchlistItemPath(accountId, businessId),
    {
      method: 'DELETE',
    },
  )
}

export function buildWatchlistItemPath(
  accountId: string,
  businessId: string,
): string {
  return `/accounts/${accountId}/watchlist/${businessId}`
}

export function buildWatchlistCollectionPath(accountId: string): string {
  return `/accounts/${accountId}/watchlist`
}

export async function listKairosTimingHistory(
  businessId: string,
): Promise<readonly TimingStageHistoryEntry[]> {
  return await requestKairosApi<readonly TimingStageHistoryEntry[]>(
    `/businesses/${businessId}/timing-history`,
    {
      method: 'GET',
    },
  )
}

export async function recalculateKairosTimingStages(
  state?: string,
): Promise<{ readonly status: 'queued' }> {
  return await requestKairosApi<{ readonly status: 'queued' }>(
    '/jobs/recalculate-timing-stages',
    {
      body: state === undefined || state === 'all' ? {} : { state },
      method: 'POST',
    },
  )
}

export async function discoverKairosBusinesses(
  payload: DiscoverBusinessesPayload,
): Promise<QueuedJobResponse> {
  return await requestKairosApi<QueuedJobResponse>('/jobs/discover-businesses', {
    body: payload,
    method: 'POST',
  })
}

export async function exportKairosBusinessesCsv(
  query?: Pick<ListBusinessesPageQuery, 'offeredService' | 'state'>,
): Promise<CsvExportResponse> {
  return await requestKairosApi<CsvExportResponse>(buildExportBusinessesPath(query), {
    method: 'GET',
  })
}

export async function exportKairosWatchlistCsv(
  accountId: string,
): Promise<CsvExportResponse> {
  return await requestKairosApi<CsvExportResponse>(
    `/accounts/${accountId}/watchlist/export.csv`,
    {
      method: 'GET',
    },
  )
}

export async function listKairosAlerts(
  accountId: string,
): Promise<readonly AlertEvent[]> {
  return await requestKairosApi<readonly AlertEvent[]>(`/accounts/${accountId}/alerts`, {
    method: 'GET',
  })
}

export async function markAlertAsRead(
  alertId: string,
): Promise<AlertEvent> {
  return await requestKairosApi<AlertEvent>(`/alerts/${alertId}/read`, {
    method: 'PATCH',
  })
}

export async function deleteAlert(
  alertId: string,
): Promise<AlertEvent> {
  return await requestKairosApi<AlertEvent>(`/alerts/${alertId}`, {
    method: 'DELETE',
  })
}

export async function countUnreadAlerts(
  accountId: string,
): Promise<number> {
  const response = await requestKairosApi<{ readonly count: number }>(
    `/accounts/${accountId}/alerts/unread-count`,
    {
      method: 'GET',
    },
  )
  return response.count
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return await requestKairosApi<DashboardStats>('/dashboard/stats', {
    method: 'GET',
  })
}

export async function createKairosOutreachSuggestion(
  company: Company,
  offeredService: OfferedService,
): Promise<OutreachSuggestion> {
  return await requestKairosApi<OutreachSuggestion>('/outreach/suggestion', {
    body: buildOutreachSuggestionPayload(company, offeredService),
    method: 'POST',
  })
}

export function buildOutreachSuggestionPayload(
  company: Company,
  offeredService: OfferedService,
): OutreachSuggestionPayload {
  const primarySignal = resolvePrimaryDigitalSignal(company)

  return {
    businessName: company.name,
    offeredService,
    signalConfidenceScore: primarySignal?.confidenceScore,
    signalImpact: primarySignal?.serviceImpact,
    signalName: resolveOutreachSignalName(primarySignal),
    timingReason: company.reason,
    timingStage: company.timingStage,
  }
}

export function resolvePrimaryDigitalSignal(
  company: Company,
): CompanyDigitalSignal | undefined {
  const signals = company.digitalSignals ?? []

  return [...signals].sort((left, right) => right.confidenceScore - left.confidenceScore)[0]
}

export function resolveOutreachSignalName(
  signal: CompanyDigitalSignal | undefined,
): DigitalSignalName {
  const signalName = signal?.signalName

  if (isDigitalSignalName(signalName)) {
    return signalName
  }

  return 'website-missing'
}

export function toCompany(business: BusinessListItem): Company {
  return {
    ageInDays: business.ageDays,
    digitalSignals: business.digitalSignals,
    id: business.id,
    industry: business.industry,
    industryEnrichment: null,
    location: {
      city: business.city ?? 'Unknown city',
      state: business.state,
    },
    name: business.name,
    opportunity: buildOpportunity(business),
    opportunityFilters: buildOpportunityFilters(business),
    reason: business.reason,
    recommendationStrength: business.recommendationStrength,
    recommendedAction: buildRecommendedAction(business.timingStage),
    registeredDate: new Date(business.registeredAt),
    scoreBreakdown: buildScoreBreakdown(business),
    source: business.source,
    sourceDocumentNumber: business.sourceDocumentNumber,
    timingScore: business.timingScore,
    timingStage: business.timingStage,
  }
}

function buildOpportunity(business: BusinessListItem) {
  const hasWebsiteMissing = business.digitalSignals.some(
    (s) => s.signalName === 'website-missing',
  )
  const hasContact = business.digitalSignals.some(
    (s) => s.signalName === 'business-contact-detected',
  )

  return {
    contactDetected: hasContact,
    digitalPresenceStatus: hasWebsiteMissing ? 'Website gap' : 'Presence detected',
    opportunityFilters: buildOpportunityFilters(business),
    opportunityReason: business.reason || 'New business with timing signals.',
    websiteStatus: hasWebsiteMissing ? 'No website detected' : 'Website may exist',
  }
}

function buildOpportunityFilters(business: BusinessListItem): readonly string[] {
  const filters: string[] = []

  if (business.digitalSignals.some((s) => s.signalName === 'website-missing')) {
    filters.push('no-website-detected')
  }

  if (business.digitalSignals.some((s) => s.signalName === 'business-contact-detected')) {
    filters.push('contact-detected')
  }

  if (business.timingScore >= 70) {
    filters.push('high-confidence')
  }

  if (business.ageDays < 30) {
    filters.push('new-entity-under-30-days')
  }

  filters.push('local-business')

  return filters
}

export function buildIndustryEnrichmentPath(state: string, companyId: string): string {
  const params = new URLSearchParams({
    companyId,
    state,
  })

  return `/businesses/industry-enrichment?${params.toString()}`
}

export function buildBusinessDetailPath(
  businessId: string,
  offeredService: OfferedService | undefined,
): string {
  if (offeredService !== undefined) {
    return `/businesses/${encodeURIComponent(businessId)}?offeredService=${encodeURIComponent(offeredService)}`
  }

  return `/businesses/${encodeURIComponent(businessId)}`
}

export function buildExportBusinessesPath(
  query: Pick<ListBusinessesPageQuery, 'offeredService' | 'state' | 'opportunityFilters'> | undefined,
): string {
  const params = new URLSearchParams()

  if (query?.state !== undefined && query.state !== 'all') {
    params.set('state', query.state)
  }

  if (query?.offeredService !== undefined) {
    params.set('offeredService', query.offeredService)
  }

  if (query?.opportunityFilters && query.opportunityFilters.length > 0) {
    params.set('opportunityFilters', query.opportunityFilters.join(','))
  }

  const queryString = params.toString()
  return queryString.length === 0
    ? '/exports/businesses.csv'
    : `/exports/businesses.csv?${queryString}`
}

async function findKairosBusinessFromList(
  businessId: string,
  query: Pick<ListBusinessesPageQuery, 'offeredService'> | undefined,
): Promise<BusinessListItem> {
  const businesses = await listKairosBusinesses(query)
  const business = businesses.find((item) => item.id === businessId)

  if (business === undefined) {
    throw new Error(
      `Business not found in fallback list: received "${businessId}"; expected business returned by Kairos API`,
    )
  }

  return business
}

function isMissingBusinessDetailRoute(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes('Cannot GET /businesses/')
}

function buildRecommendedAction(timingStage: TimingStage): string {
  if (timingStage === 'best-window') {
    return 'Reach out this week'
  }

  if (timingStage === 'warming-up') {
    return 'Add to watchlist'
  }

  if (timingStage === 'too-early') {
    return 'Monitor for now'
  }

  return 'Review before outreach'
}

function isDigitalSignalName(value: string | undefined): value is DigitalSignalName {
  return digitalSignalNames.includes(value as DigitalSignalName)
}

function buildScoreBreakdown(business: BusinessListItem) {
  if (business.scoreComponents !== undefined) {
    return {
      ageWindow: business.scoreComponents.ageFitScore,
      businessFit: business.scoreComponents.serviceNeedScore,
      contactability: business.scoreComponents.digitalReadinessScore,
      dataConfidence: business.scoreComponents.dataConfidenceScore,
      industryFit: business.scoreComponents.industryFitScore,
      penalties: business.scoreComponents.penaltyScore,
    }
  }

  return {
    ageWindow: Math.min(100, Math.max(0, business.timingScore - 10)),
    businessFit: business.digitalSignals.length,
    contactability: business.digitalSignals.filter((signal) => signal.confidenceScore >= 70).length,
    dataConfidence: Math.round(
      business.digitalSignals.reduce((total, signal) => total + signal.confidenceScore, 0) /
        Math.max(1, business.digitalSignals.length),
    ),
  }
}

const digitalSignalNames: readonly DigitalSignalName[] = [
  'website-missing',
  'domain-recently-registered',
  'website-incomplete',
  'local-presence-incomplete',
  'social-presence-misaligned',
  'social-profile-detected',
  'online-store-recently-launched',
  'website-technology-detected',
  'business-contact-detected',
]

export function buildBusinessesPath(query: ListBusinessesPageQuery): string {
  const params: string[] = []

  const addParam = (key: string, value: string | number | undefined): void => {
    if (value === undefined || value === null) {
      return
    }

    const normalizedValue = String(value)

    if (normalizedValue.trim().length === 0) {
      return
    }

    params.push(`${encodeURIComponent(key)}=${encodeURIComponent(normalizedValue)}`)
  }

  addParam('state', query.state)
  addParam('city', query.city)

  if (query.industry && query.industry !== 'all') {
    addParam('industry', query.industry)
  }

  addParam('search', query.search)

  if (query.timingStage && query.timingStage !== 'all') {
    addParam('timingStage', query.timingStage)
  }

  addParam('minScore', query.minScore)

  if (query.opportunityFilters && query.opportunityFilters.length > 0) {
    addParam('opportunityFilters', query.opportunityFilters.join(','))
  }

  addParam('offeredService', query.offeredService)
  addParam('limit', query.limit)
  addParam('offset', query.offset)

  const queryString = params.join('&')

  return queryString.length > 0
    ? `/businesses?${queryString}`
    : '/businesses'
}
