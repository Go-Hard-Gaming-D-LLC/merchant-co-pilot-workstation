import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { z } from "zod";
import { authenticate } from "../shopify.server";

// Types and schema for unified analyze entrypoint
const AnalyzeMode = z.union([
  z.literal("etsy"),
  z.literal("shopify"),
  z.literal("compliance"),
  z.literal("tags"),
  z.literal("gentle"),
  z.literal("full"),
]);

const AnalyzeSource = z.union([
  z.literal("etsy_listing"),
  z.literal("shopify_product"),
  z.literal("manual"),
  z.literal("csv_import"),
  z.literal("url_fetch"),
]);

const TargetOwnership = z.union([
  z.literal("owned"),
  z.literal("client_authorized"),
  z.literal("manual_external"),
]);

const Target = z.object({
  ownership: TargetOwnership,
  platform: z.union([z.literal("etsy"), z.literal("shopify"), z.literal("generic")]),
  storeId: z.string().optional(),
  shopDomain: z.string().optional(),
  shopName: z.string().optional(),
  listingUrl: z.string().optional(),
  productUrl: z.string().optional(),
  externalStoreName: z.string().optional(),
});

const Product = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  attributes: z.record(z.union([z.string(), z.array(z.string())])).optional(),
  price: z.union([z.number(), z.string()]).optional(),
  compareAtPrice: z.union([z.number(), z.string()]).optional(),
  handle: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().optional(),
        alt: z.string().optional(),
      })
    )
    .optional(),
  metafields: z.record(z.unknown()).optional(),
});

const Etsy = z.object({
  listingId: z.string().optional(),
  taxonomyPath: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  occasion: z.array(z.string()).optional(),
  recipient: z.array(z.string()).optional(),
  holiday: z.array(z.string()).optional(),
});

const Shopify = z.object({
  productId: z.string().optional(),
  vendor: z.string().optional(),
  productType: z.string().optional(),
  collections: z.array(z.string()).optional(),
  status: z.string().optional(),
});

const ManualInput = z.object({
  audience: z.string().optional(),
  brandName: z.string().optional(),
  notes: z.string().optional(),
  targetKeywords: z.array(z.string()).optional(),
});

const Options = z.object({
  includeTrends: z.boolean().optional(),
  includeCompliance: z.boolean().optional(),
  includeRewriteSuggestions: z.boolean().optional(),
  includeScoring: z.boolean().optional(),
  includeCompetitorHints: z.boolean().optional(),
  forceRefresh: z.boolean().optional(),
  region: z.string().optional(),
  language: z.string().optional(),
  maxSuggestions: z.number().optional(),
});

const AnalyzeRequestSchema = z.object({
  mode: AnalyzeMode,
  source: AnalyzeSource,
  target: Target,
  itemId: z.string().optional(),
  options: Options.optional(),
  product: Product.optional(),
  etsy: Etsy.optional(),
  shopify: Shopify.optional(),
  manualInput: ManualInput.optional(),
});

type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

const errorResponse = (code: string, message: string, status = 400) =>
  json({ success: false, error: { code, message } }, { status });

const ensureTargetRequirements = (payload: AnalyzeRequest) => {
  const { target } = payload;

  if (target.ownership === "owned") {
    if (!target.storeId && !target.shopDomain) {
      throw errorResponse("INVALID_PAYLOAD", "Owned targets require storeId or shopDomain", 400);
    }
  }

  if (target.ownership === "client_authorized") {
    if (!target.storeId && !target.shopDomain) {
      throw errorResponse(
        "INVALID_PAYLOAD",
        "Client-authorized targets require storeId or shopDomain",
        400
      );
    }
  }

  if (target.ownership === "manual_external") {
    const hasContent = Boolean(payload.product?.title || payload.product?.description);
    if (!hasContent) {
      throw errorResponse(
        "INSUFFICIENT_PRODUCT_DATA",
        "Manual external targets require product.title or product.description",
        400
      );
    }
  }
};

const ensureModeRequirements = (payload: AnalyzeRequest) => {
  const { mode, product } = payload;

  if (mode === "tags") {
    const hasTitle = Boolean(product?.title);
    const hasTags = Array.isArray(product?.tags) && (product?.tags?.length ?? 0) > 0;
    if (!hasTitle || !hasTags) {
      throw errorResponse(
        "INVALID_PAYLOAD",
        "Tags mode requires product.title and product.tags",
        400
      );
    }
  }

  if (mode === "compliance") {
    const hasTitleOrDescription = Boolean(product?.title || product?.description);
    if (!hasTitleOrDescription) {
      throw errorResponse(
        "INVALID_PAYLOAD",
        "Compliance mode requires product.title or product.description",
        400
      );
    }
  }

  if (mode === "shopify") {
    if (!product?.title && !payload.shopify?.productId && !payload.itemId) {
      throw errorResponse(
        "INVALID_PAYLOAD",
        "Shopify mode requires product.title or shopify.productId or itemId",
        400
      );
    }
  }

  if (mode === "etsy") {
    if (!product?.title && !payload.etsy?.listingId && !payload.itemId) {
      throw errorResponse(
        "INVALID_PAYLOAD",
        "Etsy mode requires product.title or etsy.listingId or itemId",
        400
      );
    }
  }
};

// TODO: Wire real access + analyzer execution
const resolveTargetAccess = async (payload: AnalyzeRequest) => {
  // Placeholder for future DB check and plan enforcement
  return {
    allowed: true,
    targetType: payload.target.ownership,
    connectedStore: payload.target.storeId
      ? { id: payload.target.storeId, platform: payload.target.platform }
      : undefined,
  } as const;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return errorResponse("INVALID_METHOD", "Only POST is allowed", 405);
  }

  // Authenticate the requester (not necessarily the target store)
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return errorResponse("UNAUTHENTICATED", "Authentication required", 401);
  }

  let parsed: AnalyzeRequest;
  try {
    const body = await request.json();
    parsed = AnalyzeRequestSchema.parse(body);
  } catch (err: any) {
    const message = err?.issues?.[0]?.message || err?.message || "Invalid payload";
    return errorResponse("INVALID_PAYLOAD", message, 400);
  }

  try {
    ensureTargetRequirements(parsed);
    ensureModeRequirements(parsed);
  } catch (resp) {
    return resp as Response;
  }

  const access = await resolveTargetAccess(parsed);
  if (!access.allowed) {
    return errorResponse("TARGET_ACCESS_DENIED", "You do not have permission to analyze this target", 403);
  }

  // Stub result until analyzers are wired
  const response = {
    success: true,
    mode: parsed.mode,
    targetSummary: {
      platform: parsed.target.platform,
      ownership: parsed.target.ownership,
      storeId: parsed.target.storeId,
      shopDomain: parsed.target.shopDomain,
      externalStoreName: parsed.target.externalStoreName,
      listingId: parsed.etsy?.listingId,
      productId: parsed.shopify?.productId,
      source: parsed.source,
    },
    sections: {
      summary: {
        headline: "Analysis pending",
        shortMessage: "Analyzer pipeline not yet wired",
      },
    },
    meta: {
      analyzedAt: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      cached: false,
    },
  };

  return json(response, { status: 200 });
};

export const loader = () => json({ ok: true, info: "Use POST for analysis" });
