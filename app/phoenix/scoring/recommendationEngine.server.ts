import type { RuleResult } from "../types/scoring";
import type { Recommendation } from "../types/analyzer";

export function buildRecommendations(rules: RuleResult[]): Recommendation[] {
  return rules
    .filter((r) => !r.passed)
    .map<Recommendation>((rule) => ({
      title: rule.title,
      action: rule.description,
      priority: mapPriority(rule.severity),
      category: inferCategory(rule.id),
    }))
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
}

function mapPriority(severity: RuleResult["severity"]): Recommendation["priority"] {
  switch (severity) {
    case "critical":
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "low";
  }
}

function inferCategory(ruleId: string): Recommendation["category"] {
  if (ruleId.startsWith("seo_")) return "seo";
  if (ruleId.startsWith("compliance_")) return "compliance";
  if (ruleId.startsWith("tags_")) return "tags";
  return "general";
}

function priorityWeight(priority: Recommendation["priority"]) {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
}
