import type { NormalizedProductInput } from "../../types/product";
import type { RuleFinding } from "../../types/scoring";

export function evaluateComplianceRules(product: NormalizedProductInput): RuleFinding[] {
  return [
    ...checkUnsupportedClaims(product),
    ...checkGuaranteedOutcomeLanguage(product),
    ...checkMedicalOrHealthRiskLanguage(product),
    ...checkIncomeOrPerformanceClaims(product),
    ...checkMisleadingUrgency(product),
    ...checkProhibitedPhrases(product),
  ];
}

export function checkUnsupportedClaims(product: NormalizedProductInput): RuleFinding[] {
  if (!product.description) return [];
  const text = product.description.toLowerCase();
  if (text.includes("guaranteed") || text.includes("proven")) {
    return [finding("COMP_UNSUPPORTED_CLAIM", "compliance", "fail", "high", "Unsupported claim language detected", "description")];
  }
  return [];
}

export function checkGuaranteedOutcomeLanguage(product: NormalizedProductInput): RuleFinding[] {
  if (!product.description) return [];
  const text = product.description.toLowerCase();
  if (text.includes("guaranteed results") || text.includes("will cure")) {
    return [finding("COMP_GUARANTEED_RESULT_LANGUAGE", "compliance", "fail", "high", "Guaranteed outcome language detected", "description")];
  }
  return [];
}

export function checkMedicalOrHealthRiskLanguage(product: NormalizedProductInput): RuleFinding[] {
  if (!product.description) return [];
  const text = product.description.toLowerCase();
  if (text.includes("cures") || text.includes("treats") || text.includes("heals")) {
    return [finding("COMP_MEDICAL_CLAIM_RISK", "compliance", "fail", "high", "Medical/health claim language detected", "description")];
  }
  return [];
}

export function checkIncomeOrPerformanceClaims(product: NormalizedProductInput): RuleFinding[] {
  if (!product.description) return [];
  const text = product.description.toLowerCase();
  if (text.includes("make $")) {
    return [finding("COMP_EARNINGS_CLAIM_RISK", "compliance", "fail", "high", "Earnings/performance claim detected", "description")];
  }
  return [];
}

export function checkMisleadingUrgency(product: NormalizedProductInput): RuleFinding[] {
  if (!product.description) return [];
  const text = product.description.toLowerCase();
  if (text.includes("only today") || text.includes("act now")) {
    return [finding("COMP_FALSE_URGENCY_LANGUAGE", "compliance", "warn", "medium", "Potential false urgency language", "description")];
  }
  return [];
}

export function checkProhibitedPhrases(product: NormalizedProductInput): RuleFinding[] {
  if (!product.description) return [];
  // Placeholder list; expand per platform rules
  const banned = ["best in the world"];
  const text = product.description.toLowerCase();
  const hits = banned.filter((b) => text.includes(b));
  if (hits.length) {
    return [finding("COMP_RESTRICTED_PHRASE", "compliance", "warn", "medium", "Restricted phrasing detected", "description", undefined, { hits })];
  }
  return [];
}

function finding(
  code: string,
  category: RuleFinding["category"],
  status: RuleFinding["status"],
  severity: RuleFinding["severity"],
  message: string,
  field?: string,
  currentValue?: unknown,
  metadata?: Record<string, unknown>
): RuleFinding {
  return { code, category, status, severity, message, field, currentValue, metadata };
}
