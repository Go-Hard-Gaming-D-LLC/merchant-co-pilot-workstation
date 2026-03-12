import type { NormalizedProduct } from "../types/product";
import type { RuleResult } from "../types/scoring";

export function evaluateTagRelevanceRules(product: NormalizedProduct): RuleResult[] {
  const rules: RuleResult[] = [];

  const tagCount = product.tags.length;
  rules.push({
    id: "tags_count",
    title: "Tag count",
    description: "Etsy and Shopify recommend concise, relevant tags (5-13).",
    passed: tagCount >= 5 && tagCount <= 15,
    severity: tagCount === 0 ? "high" : tagCount < 5 ? "medium" : tagCount > 20 ? "medium" : "low",
    scoreImpact: tagCount === 0 ? -10 : tagCount < 5 ? -5 : tagCount > 20 ? -3 : 0,
    details: { count: tagCount },
  });

  const lowerTitle = product.title.toLowerCase();
  const irrelevantTags = product.tags.filter((t) => {
    const lt = t.toLowerCase();
    return lt.length > 0 && !lowerTitle.includes(lt.split(" ")[0]);
  });
  const hasTooManyIrrelevant = irrelevantTags.length > Math.max(2, product.tags.length / 2);
  rules.push({
    id: "tags_relevance",
    title: "Tag relevance",
    description: "Tags should relate to the title/keywords to improve discovery",
    passed: !hasTooManyIrrelevant,
    severity: hasTooManyIrrelevant ? "medium" : "low",
    scoreImpact: hasTooManyIrrelevant ? -6 : 0,
    details: hasTooManyIrrelevant ? { irrelevantTags } : undefined,
  });

  const longTailTags = product.tags.filter((t) => t.trim().split(" ").length >= 2);
  rules.push({
    id: "tags_long_tail",
    title: "Long-tail balance",
    description: "Include some 2-3 word tags for long-tail discovery",
    passed: longTailTags.length >= 2,
    severity: longTailTags.length >= 2 ? "low" : "medium",
    scoreImpact: longTailTags.length >= 2 ? 0 : -4,
  });

  return rules;
}
