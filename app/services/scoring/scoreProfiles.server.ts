import type { ScoreProfile } from "../../types/scoring";

export const standardScoreProfile: ScoreProfile = {
  id: "standard",
  weights: {
    seo: 25,
    compliance: 20,
    tags: 20,
    content: 15,
    conversion: 10,
    trends: 10,
  },
  severityPenalty: {
    low: 4,
    medium: 8,
    high: 14,
  },
  caps: {
    maxPerFindingPenalty: 20,
    minScore: 0,
    maxScore: 100,
  },
};
