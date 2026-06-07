export const kairosQueueNames = {
  businessDiscovery: "business-discovery",
  digitalSignal: "digital-signal",
  contactEnrichment: "contact-enrichment",
  timingRecalculation: "timing-recalculation",
  timingScore: "timing-score",
  alert: "alert",
  export: "export",
} as const;

export type KairosQueueName =
  (typeof kairosQueueNames)[keyof typeof kairosQueueNames];

export const kairosJobNames = {
  discoverBusinesses: "discover-businesses",
  detectDigitalSignals: "detect-digital-signals",
  enrichBusinessContacts: "enrich-business-contacts",
  recalculateTimingStages: "recalculate-timing-stages",
  calculateTimingScore: "calculate-timing-score",
  sendAlert: "send-alert",
  generateExport: "generate-export",
} as const;

export type KairosJobName =
  (typeof kairosJobNames)[keyof typeof kairosJobNames];
