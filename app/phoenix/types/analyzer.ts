import type { NormalizedProduct } from "./product";
import type { RuleResult, ScoreBreakdown } from "./scoring";

export interface AnalyzerContext {
  shop?: string;
  channel?: "shopify" | "etsy";
  locale?: string;
  trendsEnabled?: boolean;
  trendGeo?: string;
  trendLanguage?: string;
}

export interface AnalyzerRequest {
  mode: "shopify" | "etsy" | "compliance" | "tagAudit" | "full";
  product: any;
  context?: AnalyzerContext;
}

export interface AnalyzerFinding {
  ruleId: string;
  severity: RuleResult["severity"];
  message: string;
  field?: string;
  suggestion?: string;
}

export interface Recommendation {
  title: string;
  action: string;
  priority: "high" | "medium" | "low";
  category: "seo" | "compliance" | "tags" | "general";
}

export interface AnalyzerOutput {
  product: NormalizedProduct;
  rules: RuleResult[];
  score: ScoreBreakdown;
  recommendations: Recommendation[];
  warnings?: string[];
}
