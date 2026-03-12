import type { NormalizedProductInput } from "../../types/product";
import type { RuleFinding } from "../../types/scoring";

export interface TrendResult {
  keyword: string;
  score?: number;
}

export function evaluateTagRelevanceRules(
  product: NormalizedProductInput,
  trends?: TrendResult[]
): RuleFinding[] {
  return [
    ...checkTagPresence(product),
    ...checkTagDuplication(product),
    ...checkTagSpecificity(product),
    ...checkTagTitleAlignment(product),
    ...checkTagDescriptionAlignment(product),
    ...checkTrendAlignment(product, trends),
  ];
}

export function checkTagPresence(product: NormalizedProductInput): RuleFinding[] {
  if (!product.tags || product.tags.length === 0) {
    return [finding("TAGS_MISSING", "tags", "fail", "high", "No tags provided")];
  }
  if (product.tags.length < 5) {
    return [finding("TAGS_TOO_FEW", "tags", "warn", "medium", "Consider adding more relevant tags")];
  }
  return [];
}

export function checkTagDuplication(product: NormalizedProductInput): RuleFinding[] {
  if (!product.tags) return [];
  const lower = product.tags.map((t) => t.toLowerCase());
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const t of lower) {
    if (seen.has(t)) dups.add(t);
    seen.add(t);
  }
  if (dups.size) {
    return [finding("TAGS_DUPLICATE", "tags", "warn", "medium", "Duplicate tags detected", "tags", Array.from(dups))];
  }
  return [];
}

export function checkTagSpecificity(product: NormalizedProductInput): RuleFinding[] {
  if (!product.tags) return [];
  const broad = product.tags.filter((t) => t.length <= 3 || t.toLowerCase() === "gift");
  if (broad.length) {
    return [finding("TAGS_TOO_BROAD", "tags", "warn", "medium", "Some tags are too broad", "tags", broad)];
  }
  return [];
}

export function checkTagTitleAlignment(product: NormalizedProductInput): RuleFinding[] {
  if (!product.tags || !product.title) return [];
  const title = product.title.toLowerCase();
  const mismatches = product.tags.filter((t) => !title.includes(t.toLowerCase()));
  if (mismatches.length === product.tags.length) {
    return [finding("TAGS_TITLE_MISMATCH", "tags", "warn", "high", "Tags do not align with title", "tags", mismatches)];
  }
  return [];
}

export function checkTagDescriptionAlignment(product: NormalizedProductInput): RuleFinding[] {
  if (!product.tags || !product.description) return [];
  const desc = product.description.toLowerCase();
  const misaligned = product.tags.filter((t) => !desc.includes(t.toLowerCase()));
  if (misaligned.length === product.tags.length) {
    return [finding("TAGS_DESC_MISMATCH", "tags", "warn", "high", "Tags are not reflected in description", "tags", misaligned)];
  }
  return [];
}

export function checkTrendAlignment(
  product: NormalizedProductInput,
  trends?: TrendResult[]
): RuleFinding[] {
  if (!trends || trends.length === 0) return [];
  const titleDesc = `${product.title ?? ""} ${product.description ?? ""}`.toLowerCase();
  const missingTrends = trends
    .filter((t) => t.keyword)
    .filter((t) => !titleDesc.includes(t.keyword.toLowerCase()))
    .map((t) => t.keyword);
  if (missingTrends.length) {
    return [finding("TAGS_TREND_GAP", "tags", "info", "low", "Potential trend keywords to consider", "tags", missingTrends)];
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
