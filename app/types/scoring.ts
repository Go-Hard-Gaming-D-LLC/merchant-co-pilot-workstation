export type RuleCategory = "seo" | "compliance" | "tags" | "content" | "conversion" | "trends";

export type Severity = "low" | "medium" | "high";

export type FindingStatus = "pass" | "warn" | "fail" | "info";

export interface RuleFinding {
  code: string;
  category: RuleCategory;
  status: FindingStatus;
  severity: Severity;
  message: string;
  field?: string;
  currentValue?: unknown;
  suggestedValue?: unknown;
  impact?: number; // 1-100
  confidence?: number; // 0-1
  metadata?: Record<string, unknown>;
}

export interface ScoreBreakdown {
  overall: number;
  seo: number;
  compliance: number;
  tags: number;
  content: number;
  conversion: number;
  trends: number;
}

export interface ScoredAuditResult {
  findings: RuleFinding[];
  scores: ScoreBreakdown;
  weightedContributions: Record<string, number>;
}

export interface RecommendationItem {
  id: string;
  priority: "now" | "soon" | "later";
  category: RuleCategory;
  title: string;
  whyItMatters: string;
  action: string;
  field?: string;
  basedOn: string[]; // finding codes
  estimatedImpact: number; // 1-100
}

export interface ScoreProfile {
  id: "standard" | "gentle";
  weights: {
    seo: number;
    compliance: number;
    tags: number;
    content: number;
    conversion: number;
    trends: number;
  };
  severityPenalty: {
    low: number;
    medium: number;
    high: number;
  };
  caps: {
    maxPerFindingPenalty: number;
    minScore: number;
    maxScore: number;
  };
}
