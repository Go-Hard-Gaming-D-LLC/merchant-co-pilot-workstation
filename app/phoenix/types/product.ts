export type Channel = "shopify" | "etsy" | "generic";

export interface Variant {
  id?: string;
  title?: string;
  sku?: string;
  price?: number;
  currency?: string;
  available?: boolean;
}

export interface MediaAsset {
  id?: string;
  url: string;
  alt?: string;
  position?: number;
}

export interface KeywordSet {
  primary: string;
  secondary: string[];
  longTail: string[];
}

export interface NormalizedProduct {
  channel: Channel;
  id?: string;
  handle?: string;
  title: string;
  description: string;
  tags: string[];
  keywords: KeywordSet;
  price?: number;
  currency?: string;
  vendor?: string;
  brand?: string;
  category?: string;
  variants: Variant[];
  media: MediaAsset[];
  attributes: Record<string, string | number | boolean>;
}
