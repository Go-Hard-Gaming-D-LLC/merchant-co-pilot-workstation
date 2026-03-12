import type { RecommendationItem, RuleFinding, ScoreProfile } from "../../types/scoring";

export function buildRecommendations(
  findings: RuleFinding[],
  profile: ScoreProfile
): RecommendationItem[] {
  const actionable = findings.filter((f) => f.status === "warn" || f.status === "fail");
  const grouped = groupFindingsIntoActions(actionable);

  return grouped
    .map((group) => toRecommendation(group, profile))
    .map((rec) => formatRecommendationText(rec, profile))
    .sort((a, b) => b.estimatedImpact - a.estimatedImpact);
}

function groupFindingsIntoActions(findings: RuleFinding[]): RuleFinding[][] {
  // Naive grouping by category and field for now; can be enhanced later
  const buckets = new Map<string, RuleFinding[]>();
  for (const f of findings) {
    const key = `${f.category}:${f.field ?? "_"}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(f);
  }
  return Array.from(buckets.values());
}

function toRecommendation(group: RuleFinding[], profile: ScoreProfile): RecommendationItem {
  const first = group[0];
  const codes = group.map((g) => g.code);
  const severityScore = group.reduce((max, g) => Math.max(max, severityWeight(g.severity)), 0);
  const impact = Math.min(100, Math.round(60 + severityScore * 10));

  return {
    id: `${first.category}-${codes.join("-")}`,
    priority: severityScore >= 2 ? "now" : severityScore === 1 ? "soon" : "later",
    category: first.category,
    title: titleForCategory(first.category),
    whyItMatters: whyForCategory(first.category),
    action: actionForGroup(first),
    field: first.field,
    basedOn: codes,
    estimatedImpact: impact,
  };
}

function titleForCategory(category: RuleFinding["category"]): string {
  switch (category) {
    case "seo":
      return "Improve SEO signals";
    case "compliance":
      return "Reduce compliance risk";
    case "tags":
      return "Strengthen tag relevance";
    case "content":
      return "Improve content clarity";
    case "conversion":
      return "Improve conversion readiness";
    case "trends":
      return "Incorporate relevant trends";
    default:
      return "Improve listing";
  }
}

function whyForCategory(category: RuleFinding["category"]): string {
  switch (category) {
    case "seo":
      return "Search and marketplace ranking depend on clear, keyword-aligned signals.";
    case "compliance":
      return "Risky claims can trigger policy violations and account issues.";
    case "tags":
      return "Relevant, specific tags improve discoverability and targeting.";
    case "content":
      return "Clear content helps buyers understand value quickly.";
    case "conversion":
      return "Better conversion cues help turn views into purchases.";
    case "trends":
      return "Aligning with suitable trends can boost visibility without harming relevance.";
    default:
      return "Improving this area strengthens overall performance.";
  }
}

function actionForGroup(first: RuleFinding): string {
  switch (first.category) {
    case "seo":
      return "Add the primary keyword naturally to title, meta, and opening description.";
    case "compliance":
      return "Remove or soften unsupported claims; add necessary disclaimers.";
    case "tags":
      return "Replace weak or duplicate tags with specific, product-aligned terms.";
    case "content":
      return "Clarify the offer, benefits, and specifics buyers need to know.";
    case "conversion":
      return "Add trust cues and clear calls to action.";
    case "trends":
      return "Incorporate relevant trend keywords that genuinely fit the product.";
    default:
      return "Address the highlighted issues to improve the listing.";
  }
}

function severityWeight(severity: RuleFinding["severity"]): number {
  switch (severity) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
    default:
      return 1;
  }
}

export function formatRecommendationText(
  rec: RecommendationItem,
  profile: ScoreProfile
): RecommendationItem {
  if (profile.id !== "gentle") return rec;
  return {
    ...rec,
    title: soften(rec.title),
    whyItMatters: soften(rec.whyItMatters),
    action: soften(rec.action),
  };
}

function soften(text: string): string {
  return text
    .replace("Remove", "Consider removing")
    .replace("Add", "Consider adding")
    .replace("Replace", "Consider replacing")
    .replace("Improve", "Consider improving");
}
