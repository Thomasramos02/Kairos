export type DomainEventName =
  | 'BusinessDiscovered'
  | 'DigitalSignalsRequested'
  | 'DigitalSignalDetected'
  | 'DigitalSignalsCompleted'
  | 'TimingScoreRequested'
  | 'TimingScoreCalculated'
  | 'BusinessEnteredBestWindow'
  | 'AlertRequested'
  | 'ExportRequested';

export type DomainEventPayload = Record<string, unknown>;

export type DomainEvent = {
  readonly name: DomainEventName;
  readonly aggregateId: string;
  readonly payload: DomainEventPayload;
};
