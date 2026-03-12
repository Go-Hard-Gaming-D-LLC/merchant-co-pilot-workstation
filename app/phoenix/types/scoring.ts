export type RuleSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface RuleResult {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  severity: RuleSeverity;
  scoreImpact: number; // negative values reduce overall score
  details?: Record<string, unknown>;
}

export interface ScoreBreakdown {
  overall: number;
  seo: number;
  compliance: number;
  tags: number;
  metadata?: Record<string, number>;
}

export interface WeightedScoreProfile {
  baseScore: number;
  severityWeights: Record<RuleSeverity, number>;
  minScore?: number;
  maxScore?: number;
  categoryWeights: {
    seo: number;
    compliance: number;
    tags: number;
  };
}
