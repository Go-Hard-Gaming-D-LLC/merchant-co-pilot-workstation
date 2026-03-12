import type { WeightedScoreProfile } from "../types/scoring";

export const gentleScoreProfile: WeightedScoreProfile = {
  baseScore: 82,
  minScore: 0,
  maxScore: 100,
  severityWeights: {
    info: 0,
    low: 1,
    medium: 2,
    high: 4,
    critical: 8,
  },
  categoryWeights: {
    seo: 0.45,
    compliance: 0.35,
    tags: 0.20,
  },
};
