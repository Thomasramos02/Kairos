export type CsvExportRow = {
  readonly id: string;
  readonly sourceDocumentNumber: string | null;
  readonly companyName: string;
  readonly registeredAt: string;
  readonly ageDays: number;
  readonly state: string;
  readonly city: string | null;
  readonly industry: string;
  readonly timingStage: string;
  readonly timingScore: number;
  readonly source: string;
  readonly recommendationStrength: string;
  readonly reason: string;
  readonly signalsCount: number;
  readonly websiteStatus: string;
  readonly digitalPresenceStatus: string;
  readonly contactDetected: boolean;
  readonly opportunityFilters: readonly string[];
};

export type CsvExportResponse = {
  readonly fileName: string;
  readonly contentType: 'text/csv';
  readonly csv: string;
};
