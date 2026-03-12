import type { NormalizedProductInput } from "../../types/product";
import type { RuleFinding } from "../../types/scoring";

export function evaluateSeoRules(product: NormalizedProductInput): RuleFinding[] {
  return [
    ...checkTitleLength(product),
    ...checkTitleKeywordCoverage(product),
    ...checkDescriptionLength(product),
    ...checkDescriptionKeywordCoverage(product),
    ...checkSeoTitle(product),
    ...checkSeoDescription(product),
    ...checkCategoryPresence(product),
  ];
}

export function checkTitleLength(product: NormalizedProductInput): RuleFinding[] {
  if (!product.title) {
    return [finding("SEO_TITLE_MISSING", "seo", "fail", "high", "Title is missing")];
  }
  const len = product.title.trim().length;
  if (len < 20) {
    return [finding("SEO_TITLE_TOO_SHORT", "seo", "warn", "medium", "Title is short; consider 50-70 chars", "title", len)];
  }
  if (len > 120) {
    return [finding("SEO_TITLE_TOO_LONG", "seo", "warn", "medium", "Title is long; consider under 120 chars", "title", len)];
  }
  return [];
}

export function checkTitleKeywordCoverage(product: NormalizedProductInput): RuleFinding[] {
  // Placeholder: future keyword extraction / matching
  if (!product.title) return [];
  return [];
}

export function checkDescriptionLength(product: NormalizedProductInput): RuleFinding[] {
  if (!product.description) {
    return [finding("SEO_DESCRIPTION_MISSING", "seo", "warn", "medium", "Description is missing")];
  }
  const len = product.description.trim().length;
  if (len < 80) {
    return [finding("SEO_DESCRIPTION_TOO_THIN", "seo", "warn", "medium", "Description is thin; add more detail", "description", len)];
  }
  return [];
}

export function checkDescriptionKeywordCoverage(product: NormalizedProductInput): RuleFinding[] {
  // Placeholder: future keyword extraction / matching
  if (!product.description) return [];
  return [];
}

export function checkSeoTitle(product: NormalizedProductInput): RuleFinding[] {
  if (!product.seoTitle) {
    return [finding("SEO_META_TITLE_MISSING", "seo", "warn", "medium", "SEO title/meta title is missing")];
  }
  return [];
}

export function checkSeoDescription(product: NormalizedProductInput): RuleFinding[] {
  if (!product.seoDescription) {
    return [finding("SEO_META_DESCRIPTION_MISSING", "seo", "warn", "medium", "SEO meta description is missing")];
  }
  return [];
}

export function checkCategoryPresence(product: NormalizedProductInput): RuleFinding[] {
  if (!product.category) {
    return [finding("SEO_CATEGORY_MISSING", "seo", "warn", "medium", "Category is missing")];
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
  currentValue?: unknown
): RuleFinding {
  return { code, category, status, severity, message, field, currentValue };
}
