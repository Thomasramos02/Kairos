import { OfferedService } from '../../../domain/offered-service';
import { DigitalSignalName } from '../../digital-signals/models/digital-signal.model';
import {
  RecommendationStrength,
  TimingScoreComponents,
  TimingScoreInput,
  TimingScoreResult,
  TimingSignalInput,
} from '../models/timing-score.model';
import { calculateTimingStage } from './timing-stage-calculator';

type SignalGroup =
  | 'commerce'
  | 'contact'
  | 'domain'
  | 'local'
  | 'social'
  | 'technology'
  | 'website';

type SignalWeightRule = {
  readonly group: SignalGroup;
  readonly signalName: DigitalSignalName;
  readonly weights: Partial<Record<OfferedService, number>>;
};

const signalGroupCaps: Record<SignalGroup, number> = {
  commerce: 28,
  contact: 16,
  domain: 18,
  local: 22,
  social: 26,
  technology: 18,
  website: 32,
};

const signalWeightRules: readonly SignalWeightRule[] = [
  signalRule('website-missing', 'website', {
    branding: 24,
    'website-design-development': 30,
  }),
  signalRule('website-incomplete', 'website', {
    'seo-local-seo': 24,
    'website-design-development': 28,
  }),
  signalRule('domain-recently-registered', 'domain', {
    branding: 14,
    'website-design-development': 16,
  }),
  signalRule('local-presence-incomplete', 'local', {
    'seo-local-seo': 26,
    'social-media-marketing': 14,
  }),
  signalRule('social-presence-misaligned', 'social', {
    branding: 10,
    'social-media-marketing': 26,
  }),
  signalRule('social-profile-detected', 'social', {
    'paid-marketing': 12,
    'social-media-marketing': 16,
  }),
  signalRule('online-store-recently-launched', 'commerce', {
    'e-commerce-services': 30,
    'paid-marketing': 14,
  }),
  signalRule('website-technology-detected', 'technology', {
    'e-commerce-services': 18,
    'seo-local-seo': 12,
    'website-design-development': 12,
  }),
  signalRule('business-contact-detected', 'contact', {
  'seo-local-seo': 8,
  'social-media-marketing': 8,
  'paid-marketing': 10,
  'e-commerce-services': 8,
  'website-design-development': 6,
  branding: 6,
}),
];

export function calculateTimingScore(
  timingScoreInput: TimingScoreInput,
): TimingScoreResult {
  validateTimingInput(timingScoreInput);

  const components = calculateTimingScoreComponents(timingScoreInput);
  const rawScore = sumScoreComponents(components);
  const timingScore = capLowEvidenceScore(rawScore, timingScoreInput.signals);
  const timingStage = calculateTimingStage(timingScore, timingScoreInput.ageDays);

  return {
    components,
    recommendationStrength: classifyRecommendationStrength(
      timingScore,
      timingScoreInput.signals,
      components.serviceNeedScore,
    ),
    reason: buildTimingReason(timingScore, timingStage, timingScoreInput, components),
    timingScore,
    timingStage,
  };
}

export function calculateTimingScoreComponents(
  input: TimingScoreInput,
): TimingScoreComponents {
  return {
    ageFitScore: calculateAgeFitScore(input.ageDays),
    dataConfidenceScore: calculateDataConfidenceScore(input),
    digitalReadinessScore: calculateDigitalReadinessScore(input.signals),
    industryFitScore: calculateIndustryFitScore(input),
    penaltyScore: calculatePenaltyScore(input),
    serviceNeedScore: calculateServiceNeedScore(input),
  };
}

function validateTimingInput(input: TimingScoreInput): void {
  if (input.ageDays < 0) {
    throw new Error(`Invalid ageDays: received ${input.ageDays}; expected >= 0`);
  }

  if (input.industry.trim().length === 0) {
    throw new Error('Invalid industry: received ""; expected non-empty industry');
  }
}

function calculateServiceNeedScore(input: TimingScoreInput): number {
  const groupScores = new Map<SignalGroup, number>();

  for (const signal of input.signals) {
    const rule = findSignalWeightRule(signal.signalName);
    const score = calculateWeightedSignalScore(signal, input.offeredService, rule);
    groupScores.set(rule.group, (groupScores.get(rule.group) ?? 0) + score);
  }

  return [...groupScores.entries()].reduce(
    (total, [group, score]) => total + Math.min(score, signalGroupCaps[group]),
    0,
  );
}

function calculateWeightedSignalScore(
  signal: TimingSignalInput,
  offeredService: OfferedService,
  rule: SignalWeightRule,
): number {
  const weight = rule.weights[offeredService] ?? 6;
  return Math.round((weight * signal.confidenceScore) / 100);
}

function calculateDigitalReadinessScore(
  signals: readonly TimingSignalInput[],
): number {
  const baseScore = Math.min(8, signals.length * 2);
  const evidenceScore = signals.reduce(
    (total, signal) => total + calculateEvidenceScore(signal),
    0,
  );

  return Math.min(18, baseScore + evidenceScore);
}

function calculateEvidenceScore(signal: TimingSignalInput): number {
  if (signal.signalName === 'website-technology-detected') return 5;
  if (signal.signalName === 'social-profile-detected') return 4;
  if (signal.signalName === 'domain-recently-registered') return 3;
  if (signal.confidenceScore >= 80) return 2;
  return 1;
}

function calculateIndustryFitScore(input: TimingScoreInput): number {
  if (isUnclassifiedIndustry(input.industry)) {
    return 0;
  }

  return isFloridaRegistrySource(input.sourceName) ? 5 : 8;
}

function calculateDataConfidenceScore(input: TimingScoreInput): number {
  const sourceScore = isFloridaRegistrySource(input.sourceName) ? 9 : 12;
  const cityScore = input.city === null ? 0 : 3;
  const industryScore = isUnclassifiedIndustry(input.industry) ? 0 : 3;

  return Math.min(18, sourceScore + cityScore + industryScore);
}

function calculatePenaltyScore(input: TimingScoreInput): number {
  return [
    input.signals.length === 0 ? 18 : 0,
    isUnclassifiedIndustry(input.industry) ? 8 : 0,
    input.city === null ? 5 : 0,
    calculateAgePenalty(input.ageDays),
  ].reduce((total, penalty) => total + penalty, 0);
}

function calculateAgeFitScore(ageDays: number): number {
  if (ageDays <= 3) return 6;
  if (ageDays <= 14) return 14;
  if (ageDays <= 45) return 20;
  if (ageDays <= 90) return 12;
  if (ageDays <= 120) return 5;
  return 0;
}

function calculateAgePenalty(ageDays: number): number {
  if (ageDays >= 120) return 15;
  if (ageDays > 90) return 8;
  return 0;
}

function sumScoreComponents(components: TimingScoreComponents): number {
  return clampScore(
    components.ageFitScore +
      components.dataConfidenceScore +
      components.digitalReadinessScore +
      components.industryFitScore +
      components.serviceNeedScore -
      components.penaltyScore,
  );
}

function capLowEvidenceScore(
  timingScore: number,
  signals: readonly TimingSignalInput[],
): number {
  if (signals.length === 0) {
    return Math.min(timingScore, 55);
  }

  return timingScore;
}

function classifyRecommendationStrength(
  timingScore: number,
  signals: readonly TimingSignalInput[],
  serviceNeedScore: number,
): RecommendationStrength {
  if (timingScore >= 75 && serviceNeedScore >= 22 && signals.length > 0) {
    return 'strong-match';
  }

  if (timingScore >= 60 && (serviceNeedScore >= 12 || signals.length > 0)) {
    return 'relevant';
  }

  return timingScore >= 45 ? 'monitor' : 'low-fit';
}

function buildTimingReason(
  timingScore: number,
  timingStage: string,
  input: TimingScoreInput,
  components: TimingScoreComponents,
): string {
  return [
    `${input.signals.length} digital signals produced score ${timingScore} and stage ${timingStage}.`,
    `Components: age ${components.ageFitScore}, service need ${components.serviceNeedScore}, digital readiness ${components.digitalReadinessScore}, industry fit ${components.industryFitScore}, data confidence ${components.dataConfidenceScore}, penalties ${components.penaltyScore}.`,
  ].join(' ');
}

function findSignalWeightRule(signalName: DigitalSignalName): SignalWeightRule {
  const rule = signalWeightRules.find((item) => item.signalName === signalName);

  if (rule === undefined) {
    throw new Error(
      `Invalid signalName: received "${signalName}"; expected supported digital signal`,
    );
  }

  return rule;
}

function signalRule(
  signalName: DigitalSignalName,
  group: SignalGroup,
  weights: Partial<Record<OfferedService, number>>,
): SignalWeightRule {
  return { group, signalName, weights };
}

function isFloridaRegistrySource(sourceName: string): boolean {
  return sourceName.toLowerCase().includes('florida division of corporations');
}

function isUnclassifiedIndustry(industry: string): boolean {
  return industry.trim().toLowerCase() === 'unclassified';
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}
