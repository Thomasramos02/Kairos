export type RegistrySourceRunStatus = "running" | "completed" | "failed";

export type RegistrySourceRun = {
  readonly id: string;
  readonly state: string;
  readonly sourceName: string;
  readonly sourceCursor: string | null;
  readonly status: RegistrySourceRunStatus;
  readonly recordsFound: number;
  readonly recordsCreated: number;
  readonly errorMessage: string | null;
  readonly startedAt: string;
  readonly finishedAt: string | null;
};

export type StartRegistrySourceRunInput = {
  readonly state: string;
  readonly sourceName: string;
};

export type CompleteRegistrySourceRunInput = {
  readonly sourceCursor: string | null;
  readonly recordsFound: number;
  readonly recordsCreated: number;
};
