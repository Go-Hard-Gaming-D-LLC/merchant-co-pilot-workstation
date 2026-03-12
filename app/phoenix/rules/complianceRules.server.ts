import type { NormalizedProduct } from "../types/product";
import type { RuleResult } from "../types/scoring";

const RESTRICTED_WORDS = ["free shipping for life", "lifetime guarantee", "fake", "replica", "copycat"];

export function evaluateComplianceRules(product: NormalizedProduct): RuleResult[] {
  const rules: RuleResult[] = [];

  const hasPolicySignals = Boolean(product.attributes?.policies || product.attributes?.hasPolicies);
  rules.push({
    id: "compliance_policy_presence",
    title: "Policy coverage",
    description: "Include shipping, returns, and privacy policies to satisfy trust checks",
    passed: hasPolicySignals,
    severity: hasPolicySignals ? "low" : "high",
    scoreImpact: hasPolicySignals ? 0 : -12,
  });

  const hasContactSignal = Boolean(product.attributes?.contact || product.attributes?.supportEmail || product.attributes?.phone);
  rules.push({
    id: "compliance_contact",
    title: "Contact signal",
    description: "Provide clear contact methods (email or phone) to avoid GMC misrepresentation flags",
    passed: hasContactSignal,
    severity: hasContactSignal ? "low" : "medium",
    scoreImpact: hasContactSignal ? 0 : -6,
  });

  const lowerDesc = (product.description || "").toLowerCase();
  const matchedRestricted = RESTRICTED_WORDS.filter((word) => lowerDesc.includes(word));
  rules.push({
    id: "compliance_restricted_claims",
    title: "Restricted claims",
    description: "Avoid risky language that triggers Google Merchant Center misrepresentation flags",
    passed: matchedRestricted.length === 0,
    severity: matchedRestricted.length === 0 ? "low" : "critical",
    scoreImpact: matchedRestricted.length === 0 ? 0 : -20,
    details: matchedRestricted.length ? { matched: matchedRestricted } : undefined,
  });

  const hasShippingClarity = Boolean(product.attributes?.shipping || product.attributes?.hasShippingInfo);
  rules.push({
    id: "compliance_shipping",
    title: "Shipping clarity",
    description: "State shipping timelines and carriers to reduce chargeback risk",
    passed: hasShippingClarity,
    severity: hasShippingClarity ? "low" : "medium",
    scoreImpact: hasShippingClarity ? 0 : -5,
  });

  const hasReturns = Boolean(product.attributes?.returns || product.attributes?.hasReturnPolicy);
  rules.push({
    id: "compliance_returns",
    title: "Return policy",
    description: "Return policy must be explicit to pass trust audits",
    passed: hasReturns,
    severity: hasReturns ? "low" : "medium",
    scoreImpact: hasReturns ? 0 : -5,
  });

  return rules;
}
