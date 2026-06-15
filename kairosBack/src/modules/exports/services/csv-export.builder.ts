import { CsvExportRow } from '../models/export.model';

const csvHeaders = [
  'id',
  'source_document_number',
  'company_name',
  'registered_at',
  'age_days',
  'state',
  'city',
  'industry',
  'timing_stage',
  'timing_score',
  'website_status',
  'digital_presence_status',
  'contact_detected',
  'opportunity_filters',
  'source',
  'recommendation_strength',
  'reason',
  'signals_count',
] as const;

export function buildBusinessesCsv(rows: readonly CsvExportRow[]): string {
  const csvRows = rows.map((row) =>
    [
      row.id,
      row.sourceDocumentNumber ?? '',
      row.companyName,
      row.registeredAt,
      row.ageDays.toString(),
      row.state,
      row.city ?? '',
      row.industry,
      row.timingStage,
      row.timingScore.toString(),
      row.websiteStatus,
      row.digitalPresenceStatus,
      String(row.contactDetected),
      row.opportunityFilters.join('|'),
      row.source,
      row.recommendationStrength,
      row.reason,
      row.signalsCount.toString(),
    ].map(escapeCsvValue),
  );

  return [csvHeaders, ...csvRows].map((row) => row.join(',')).join('\n');
}

function escapeCsvValue(value: string): string {
  if (!value.includes(',') && !value.includes('"') && !value.includes('\n')) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}
