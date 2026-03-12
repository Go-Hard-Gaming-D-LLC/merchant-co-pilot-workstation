# Phoenix Flow Core (Analyzer Layer)

This directory contains the server-only analyzer stack that powers the Phoenix Flow evaluations. The flow is:

```
input → normalize → run rules → score → recommend → respond
```

## Structure

- `types/` – shared shapes for products, scoring, analyzers.
- `normalizers/` – convert Shopify/Etsy/raw payloads into a common `NormalizedProduct`.
- `rules/` – focused rule sets (SEO, compliance, tag relevance).
- `scoring/` – scoring profiles and recommendation builder.
- `analyzers/` – orchestrators per mode (shopify, etsy, compliance-only, tag audit, full).
- `index.server.ts` – barrel exports for easy imports.

## Minimal env

Only trend lookups are gated; the rest is pure logic.

```
SERPAPI_KEY=
GOOGLE_TRENDS_GEO=US
GOOGLE_TRENDS_LANGUAGE=en
TREND_CACHE_TTL=3600
```

## Usage

POST to `routes/api.analyze.ts` with:

```json
{
  "mode": "shopify" | "etsy" | "compliance" | "tagAudit" | "full",
  "product": { ...sourceShape },
  "context": { "locale": "en", "channel": "shopify" }
}
```

The route authenticates via Shopify, runs the selected analyzer, and returns:

```json
{
  "success": true,
  "result": {
    "product": { ...normalized },
    "rules": [ ... ],
    "score": { overall, seo, compliance, tags },
    "recommendations": [ ... ]
  }
}
```

Trend provider is stubbed; when `SERPAPI_KEY` is absent, trend enrichment is skipped automatically.
