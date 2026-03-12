import type { AnalyzerContext, AnalyzerOutput } from "../types/analyzer";
import { normalizeGenericProduct } from "../normalizers/productNormalizer.server";
import { evaluateComplianceRules } from "../rules/complianceRules.server";
import { assembleOutput } from "./baseAnalyzer.server";

export function analyzeCompliance(raw: any, context?: AnalyzerContext): AnalyzerOutput {
  const product = normalizeGenericProduct(raw, context?.channel || "generic");
  const rules = [...evaluateComplianceRules(product)];
  return assembleOutput(product, rules, context);
}
