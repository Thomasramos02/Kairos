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
