export interface NormalizedImage {
  url?: string;
  alt?: string;
}

export interface NormalizedProductInput {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  attributes?: Record<string, string | string[]>;
  seoTitle?: string;
  seoDescription?: string;
  price?: number | string;
  compareAtPrice?: number | string;
  images?: NormalizedImage[];
}
