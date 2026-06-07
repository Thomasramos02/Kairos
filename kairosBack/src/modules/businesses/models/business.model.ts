import { BusinessContactMethod } from "../../digital-signals/models/digital-signal.model";
import { BusinessLifecycleStage } from './business-lifecycle.model';

export type BusinessSourceCoverageStatus = 'active' | 'limited' | 'unavailable';

export type BusinessRegistrationSource = {
  readonly state: string;
  readonly sourceName: string;
  readonly coverageStatus: BusinessSourceCoverageStatus;
};

export type DiscoveredBusiness = {
  readonly id: string;
  readonly sourceDocumentNumber: string | null;
  readonly legalName: string;
  readonly state: string;
  readonly city: string | null;
  readonly industry: string;
  readonly lifecycleStage: BusinessLifecycleStage;
  readonly archivedAt: Date | null;
  readonly registeredAt: Date;
  readonly sourceName: string;
};

export type NewDiscoveredBusiness = Omit<
  DiscoveredBusiness,
  'archivedAt' | 'id' | 'lifecycleStage'
> & {
  readonly contactMethods?: readonly BusinessContactMethod[];
};
