import { offeredServices } from "../../../domain/offered-service";
import { DiscoveredBusiness } from "../../businesses/models/business.model";
import { calculateBusinessAgeDays } from "../../businesses/services/business-age-calculator";
import { TimingScoreUpsertInput } from "../timing-scores.repository";
import { calculateTimingScore } from "./timing-score-calculator";
import { rankTimingStage } from "./timing-stage-ranker";

const initialScoreVersion = 2;
const initialRefreshMs = 60 * 60 * 1000;

export function buildInitialTimingScoreInputs(
  business: DiscoveredBusiness,
  calculatedAt: Date,
): readonly TimingScoreUpsertInput[] {
  return offeredServices.map((offeredService) => {
    const score = calculateTimingScore({
      ageDays: calculateBusinessAgeDays(business.registeredAt, calculatedAt),
      city: business.city,
      industry: business.industry,
      offeredService,
      signals: [],
      sourceName: business.sourceName,
    });

    return {
      businessId: business.id,
      calculatedAt,
      errorMessage: null,
      nextRefreshAt: new Date(calculatedAt.getTime() + initialRefreshMs),
      offeredService,
      reason: `${score.reason} Initial score created before digital signal enrichment completed.`,
      scoreVersion: initialScoreVersion,
      signalsCount: 0,
      status: "ready",
      timingRank: rankTimingStage(score.timingStage),
      timingScore: score.timingScore,
      timingStage: score.timingStage,
    };
  });
}
