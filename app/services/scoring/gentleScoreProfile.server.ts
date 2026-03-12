import type { ScoreProfile } from "../../types/scoring";

export const gentleScoreProfile: ScoreProfile = {
  id: "gentle",
  weights: {
    seo: 30,
    compliance: 15,
    tags: 25,
    content: 15,
    conversion: 10,
    trends: 5,
  },
  severityPenalty: {
    low: 2,
    medium: 5,
    high: 8,
  },
  caps: {
    maxPerFindingPenalty: 10,
    minScore: 35,
    maxScore: 100,
  },
};
