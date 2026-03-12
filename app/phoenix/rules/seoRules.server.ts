import type { NormalizedProduct } from "../types/product";
import type { RuleResult } from "../types/scoring";

export function evaluateSeoRules(product: NormalizedProduct): RuleResult[] {
  const rules: RuleResult[] = [];

  const titleLength = product.title.length;
  rules.push({
    id: "seo_title_length",
    title: "Title length",
    description: "Keep titles between 20-120 characters for marketplaces",
    passed: titleLength >= 20 && titleLength <= 120,
    severity: titleLength < 10 ? "high" : titleLength > 150 ? "medium" : "low",
    scoreImpact: titleLength < 10 || titleLength > 150 ? -8 : titleLength < 20 || titleLength > 120 ? -4 : 0,
    details: { length: titleLength },
  });

  const hasPrimaryKeyword = !!product.keywords.primary && product.title.toLowerCase().includes(product.keywords.primary.toLowerCase());
  rules.push({
    id: "seo_primary_keyword",
    title: "Primary keyword in title",
    description: "Ensure the primary keyword is present in the product title",
    passed: hasPrimaryKeyword,
    severity: hasPrimaryKeyword ? "low" : "medium",
    scoreImpact: hasPrimaryKeyword ? 0 : -6,
  });

  const descriptionLength = product.description.length;
  rules.push({
    id: "seo_description_depth",
    title: "Description depth",
    description: "Descriptions under 120 characters rarely rank; aim for 300+",
    passed: descriptionLength >= 300,
    severity: descriptionLength < 120 ? "high" : descriptionLength < 300 ? "medium" : "low",
    scoreImpact: descriptionLength < 120 ? -10 : descriptionLength < 300 ? -5 : 0,
    details: { length: descriptionLength },
  });

  const hasAltTextCoverage = product.media.length === 0 || product.media.some((m) => !!m.alt);
  rules.push({
    id: "seo_alt_text",
    title: "Alt text present",
    description: "At least one media asset should include descriptive alt text",
    passed: hasAltTextCoverage,
    severity: hasAltTextCoverage ? "low" : "medium",
    scoreImpact: hasAltTextCoverage ? 0 : -4,
  });

  const hasSchema = product.attributes?.hasSchema === true;
  rules.push({
    id: "seo_schema_markup",
    title: "Structured data",
    description: "Add JSON-LD product schema to qualify for rich results",
    passed: hasSchema,
    severity: hasSchema ? "low" : "medium",
    scoreImpact: hasSchema ? 0 : -5,
  });

  return rules;
}
