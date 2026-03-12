import type { KeywordSet } from "../types/product";

const splitWords = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

export function normalizeKeywords(input: { title?: string; tags?: string[]; description?: string }): KeywordSet {
  const title = input.title || "";
  const tags = input.tags || [];
  const description = input.description || "";

  const titleWords = splitWords(title);
  const tagWords = tags.flatMap((t) => splitWords(t));
  const descWords = splitWords(description).slice(0, 40); // keep short for relevance

  const all = [...titleWords, ...tagWords, ...descWords];
  const unique = Array.from(new Set(all));

  const primary = titleWords[0] || unique[0] || "";
  const secondary = unique.filter((w) => w !== primary).slice(0, 10);
  const longTail = unique
    .filter((w) => w.length > 6)
    .slice(0, 10);

  return {
    primary,
    secondary,
    longTail,
  };
}
