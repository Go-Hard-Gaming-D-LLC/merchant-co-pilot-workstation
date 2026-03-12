import type { AnalyzerOutput, AnalyzerContext } from "../types/analyzer";
import type { NormalizedProduct } from "../types/product";
import type { RuleResult } from "../types/scoring";
import { gentleScoreProfile } from "../scoring/gentleScoreProfile.server";
import { calculateScore } from "../scoring/scoreEngine.server";
import { buildRecommendations } from "../scoring/recommendationEngine.server";

export function assembleOutput(
  product: NormalizedProduct,
  rules: RuleResult[],
  _context?: AnalyzerContext
): AnalyzerOutput {
  const score = calculateScore(rules, gentleScoreProfile);
  const recommendations = buildRecommendations(rules);
  return {
    product,
    rules,
    score,
    recommendations,
  };
}
