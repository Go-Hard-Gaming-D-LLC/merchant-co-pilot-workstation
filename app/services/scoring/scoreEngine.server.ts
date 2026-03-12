import type {
  RuleFinding,
  ScoreBreakdown,
  ScoreProfile,
  ScoredAuditResult,
  RuleCategory,
} from "../../types/scoring";
import { standardScoreProfile } from "./scoreProfiles.server";

export function scoreFindings(
  findings: RuleFinding[],
  profile: ScoreProfile = standardScoreProfile
): ScoredAuditResult {
  const categoryScores: Record<RuleCategory, number> = {
    seo: 100,
    compliance: 100,
    tags: 100,
    content: 100,
    conversion: 100,
    trends: 100,
  };

  const weightedContributions: Record<string, number> = {};

  for (const finding of findings) {
    const penalty = getPenaltyForFinding(finding, profile);
    categoryScores[finding.category] = clampScore(
      categoryScores[finding.category] - penalty,
      profile.caps.minScore,
      profile.caps.maxScore
    );
    weightedContributions[finding.code] = penalty;
  }

  const scores: ScoreBreakdown = {
    seo: categoryScores.seo,
    compliance: categoryScores.compliance,
    tags: categoryScores.tags,
    content: categoryScores.content,
    conversion: categoryScores.conversion,
    trends: categoryScores.trends,
    overall: computeWeightedOverall(categoryScores, profile),
  };

  return { findings, scores, weightedContributions };
}

export function getPenaltyForFinding(
  finding: RuleFinding,
  profile: ScoreProfile
): number {
  if (finding.status === "pass" || finding.status === "info") return 0;

  const base = profile.severityPenalty[finding.severity];
  const statusMultiplier = finding.status === "fail" ? 1 : 0.6;
  const impactMultiplier = finding.impact ? Math.max(0.5, Math.min(1.5, finding.impact / 50)) : 1;

  return Math.min(
    Math.round(base * statusMultiplier * impactMultiplier),
    profile.caps.maxPerFindingPenalty
  );
}

export function computeWeightedOverall(
  categoryScores: Omit<ScoreBreakdown, "overall">,
  profile: ScoreProfile
): number {
  const totalWeight =
    profile.weights.seo +
    profile.weights.compliance +
    profile.weights.tags +
    profile.weights.content +
    profile.weights.conversion +
    profile.weights.trends;

  const weighted =
    categoryScores.seo * profile.weights.seo +
    categoryScores.compliance * profile.weights.compliance +
    categoryScores.tags * profile.weights.tags +
    categoryScores.content * profile.weights.content +
    categoryScores.conversion * profile.weights.conversion +
    categoryScores.trends * profile.weights.trends;

  return Math.round(weighted / totalWeight);
}

function clampScore(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
