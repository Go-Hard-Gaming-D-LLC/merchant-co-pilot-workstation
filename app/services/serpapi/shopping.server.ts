type Fetcher = typeof fetch;

export interface ShoppingSearchParams {
  query: string;
  location?: string;
  hl?: string;
  gl?: string;
}

export interface ShoppingResult {
  title?: string;
  price?: string;
  source?: string;
  product_link?: string;
  thumbnail?: string;
}

export function buildShoppingUrl(params: ShoppingSearchParams, apiKey?: string): string {
  const key = apiKey || process.env.SERPAPI_KEY || process.env.VITE_SERPAPI_API_KEY;
  if (!key) throw new Error("SERPAPI_KEY is required");

  const qs = new URLSearchParams({
    engine: "google_shopping",
    q: params.query,
    hl: params.hl ?? "en",
    gl: params.gl ?? "us",
    api_key: key,
  });

  if (params.location) qs.set("location", params.location);

  return `https://serpapi.com/search.json?${qs.toString()}`;
}

export async function fetchShoppingResults(
  params: ShoppingSearchParams,
  fetchImpl: Fetcher = fetch
): Promise<ShoppingResult[]> {
  const url = buildShoppingUrl(params);
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`SerpApi request failed: ${res.status}`);
  const json = (await res.json()) as { shopping_results?: ShoppingResult[] };
  return json.shopping_results ?? [];
}
