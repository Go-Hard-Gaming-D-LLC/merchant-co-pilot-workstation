import type { AnalyzerContext, AnalyzerOutput } from "../types/analyzer";
import { normalizeGenericProduct } from "../normalizers/productNormalizer.server";
import { evaluateTagRelevanceRules } from "../rules/tagRelevanceRules.server";
import { assembleOutput } from "./baseAnalyzer.server";

export function analyzeTagAudit(raw: any, context?: AnalyzerContext): AnalyzerOutput {
  const product = normalizeGenericProduct(raw, context?.channel || "generic");
  const rules = [...evaluateTagRelevanceRules(product)];
  return assembleOutput(product, rules, context);
}
