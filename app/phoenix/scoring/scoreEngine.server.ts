import type { RuleResult, ScoreBreakdown, WeightedScoreProfile } from "../types/scoring";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function calculateScore(
  rules: RuleResult[],
  profile: WeightedScoreProfile
): ScoreBreakdown {
  const seoRules = rules.filter((r) => r.id.startsWith("seo_"));
  const complianceRules = rules.filter((r) => r.id.startsWith("compliance_"));
  const tagRules = rules.filter((r) => r.id.startsWith("tags_"));

  const computeCategoryScore = (set: RuleResult[]) => {
    const penalty = set.reduce((sum, rule) => {
      const weight = profile.severityWeights[rule.severity] ?? 1;
      return sum + (rule.passed ? 0 : Math.abs(rule.scoreImpact) * weight);
    }, 0);
    const raw = profile.baseScore - penalty;
    return clamp(raw, profile.minScore ?? 0, profile.maxScore ?? 100);
  };

  const seo = computeCategoryScore(seoRules);
  const compliance = computeCategoryScore(complianceRules);
  const tags = computeCategoryScore(tagRules);

  const overall = clamp(
    seo * profile.categoryWeights.seo +
      compliance * profile.categoryWeights.compliance +
      tags * profile.categoryWeights.tags,
    profile.minScore ?? 0,
    profile.maxScore ?? 100
  );

  return {
    overall: Math.round(overall),
    seo: Math.round(seo),
    compliance: Math.round(compliance),
    tags: Math.round(tags),
    metadata: { ruleCount: rules.length },
  };
}
