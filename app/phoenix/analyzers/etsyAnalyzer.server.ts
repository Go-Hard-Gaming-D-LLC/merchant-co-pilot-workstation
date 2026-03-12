import type { AnalyzerContext, AnalyzerOutput } from "../types/analyzer";
import type { NormalizedProduct } from "../types/product";
import { normalizeEtsyProduct } from "../normalizers/productNormalizer.server";
import { evaluateSeoRules } from "../rules/seoRules.server";
import { evaluateComplianceRules } from "../rules/complianceRules.server";
import { evaluateTagRelevanceRules } from "../rules/tagRelevanceRules.server";
import { assembleOutput } from "./baseAnalyzer.server";

export function analyzeEtsyProduct(raw: any, context?: AnalyzerContext): AnalyzerOutput {
  const product: NormalizedProduct = normalizeEtsyProduct(raw);
  const rules = [
    ...evaluateSeoRules(product),
    ...evaluateComplianceRules(product),
    ...evaluateTagRelevanceRules(product),
  ];
  return assembleOutput(product, rules, context);
}
