import type { NormalizedProduct, MediaAsset, Variant, Channel, KeywordSet } from "../types/product";
import { normalizeKeywords } from "./keywordNormalizer.server";

type ShopifyProduct = {
  id?: string;
  handle?: string;
  title?: string;
  bodyHtml?: string;
  tags?: string;
  vendor?: string;
  productType?: string;
  variants?: { edges?: { node: any }[] } | any[];
  images?: { edges?: { node: any }[] } | any[];
};

type EtsyListing = {
  listing_id?: number;
  title?: string;
  description?: string;
  tags?: string[];
  price?: string;
  currency_code?: string;
  state?: string;
  url?: string;
  images?: { url_fullxfull: string; rank?: number }[];
};

const toArray = <T>(input?: T | T[] | null): T[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return [input];
};

const cleanText = (value?: string | null) => (value || "").replace(/\s+/g, " ").trim();

const parsePrice = (value?: string | number | null): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num : undefined;
};

function normalizeShopifyVariants(raw?: ShopifyProduct["variants"]): Variant[] {
  const edges = (raw as any)?.edges || toArray(raw as any);
  return edges
    .map((edge: any) => edge?.node || edge)
    .filter(Boolean)
    .map((variant: any) => ({
      id: variant.id,
      title: cleanText(variant.title),
      sku: variant.sku,
      price: parsePrice(variant.price),
      currency: variant.currency || variant.priceCurrency,
      available: variant.availableForSale ?? variant.available ?? true,
    }));
}

function normalizeShopifyImages(raw?: ShopifyProduct["images"]): MediaAsset[] {
  const edges = (raw as any)?.edges || toArray(raw as any);
  return edges
    .map((edge: any) => edge?.node || edge)
    .filter(Boolean)
    .map((img: any, idx: number) => ({
      id: img.id,
      url: img.originalSrc || img.url || img.src,
      alt: cleanText(img.altText),
      position: img.position ?? idx + 1,
    }))
    .filter((img: MediaAsset) => Boolean(img.url));
}

function normalizeEtsyImages(raw?: EtsyListing["images"]): MediaAsset[] {
  return toArray(raw)
    .map((img, idx) => ({
      url: img.url_fullxfull,
      position: img.rank ?? idx + 1,
    }))
    .filter((img: MediaAsset) => Boolean(img.url));
}

export function normalizeShopifyProduct(product: ShopifyProduct): NormalizedProduct {
  const title = cleanText(product.title) || "Untitled Product";
  const description = cleanText(product.bodyHtml) || "";

  const tags = cleanText(product.tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const variants = normalizeShopifyVariants(product.variants);
  const media = normalizeShopifyImages(product.images);

  const keywords: KeywordSet = normalizeKeywords({ title, tags, description });

  return {
    channel: "shopify",
    id: product.id,
    handle: product.handle,
    title,
    description,
    tags,
    keywords,
    price: variants[0]?.price,
    currency: variants[0]?.currency,
    vendor: product.vendor,
    brand: product.vendor,
    category: product.productType,
    variants,
    media,
    attributes: {},
  };
}

export function normalizeEtsyProduct(listing: EtsyListing): NormalizedProduct {
  const title = cleanText(listing.title) || "Untitled Listing";
  const description = cleanText(listing.description) || "";
  const tags = toArray(listing.tags).map((t) => cleanText(t)).filter(Boolean);
  const media = normalizeEtsyImages(listing.images);
  const price = parsePrice(listing.price);

  const keywords: KeywordSet = normalizeKeywords({ title, tags, description });

  return {
    channel: "etsy",
    id: listing.listing_id?.toString(),
    handle: listing.url,
    title,
    description,
    tags,
    keywords,
    price,
    currency: listing.currency_code,
    vendor: undefined,
    brand: undefined,
    category: undefined,
    variants: [],
    media,
    attributes: { state: listing.state },
  };
}

export function normalizeGenericProduct(product: any, channel: Channel = "generic"): NormalizedProduct {
  const title = cleanText(product.title) || "Untitled";
  const description = cleanText(product.description) || "";
  const tags: string[] = toArray(product.tags)
    .map((t) => cleanText(String(t)))
    .filter(Boolean);

  const media: MediaAsset[] = toArray(product.media)
    .map((m: any, idx) => ({
      id: m.id,
      url: m.url || m.src,
      alt: cleanText(m.alt),
      position: m.position ?? idx + 1,
    }))
    .filter((m) => Boolean(m.url));

  const variants: Variant[] = toArray(product.variants)
    .map((v: any) => ({
      id: v.id,
      title: cleanText(v.title),
      sku: v.sku,
      price: parsePrice(v.price),
      currency: v.currency,
      available: v.available ?? true,
    }))
    .filter((v) => Boolean(v.title) || Boolean(v.price));

  const keywords: KeywordSet = normalizeKeywords({ title, tags, description });

  return {
    channel,
    id: product.id,
    handle: product.handle,
    title,
    description,
    tags,
    keywords,
    price: parsePrice(product.price),
    currency: product.currency,
    vendor: product.vendor,
    brand: product.brand,
    category: product.category,
    variants,
    media,
    attributes: product.attributes || {},
  };
}
