import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { authenticate } from "../shopify.server";
import {
  analyzeShopifyProduct,
  analyzeEtsyProduct,
  analyzeCompliance,
  analyzeTagAudit,
  analyzeFull,
  type AnalyzerContext,
} from "../phoenix/index.server";

type AnalyzeMode = "shopify" | "etsy" | "compliance" | "tagAudit" | "full";

interface AnalyzePayload {
  mode: AnalyzeMode;
  product: any;
  context?: AnalyzerContext;
}

function getEnvContext(context: any): AnalyzerContext {
  const env = (context as any)?.cloudflare?.env || (context as any)?.env || process.env;
  return {
    trendsEnabled: Boolean(env.SERPAPI_KEY),
    trendGeo: env.GOOGLE_TRENDS_GEO || "US",
    trendLanguage: env.GOOGLE_TRENDS_LANGUAGE || "en",
  };
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    return json({ error: "Invalid content type" }, { status: 400 });
  }

  let payload: AnalyzePayload;
  try {
    payload = await request.json();
  } catch (err) {
    return json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { mode, product, context: ctx } = payload || {};
  if (!mode || !product) {
    return json({ error: "Missing mode or product" }, { status: 400 });
  }

  const analyzerContext: AnalyzerContext = {
    shop: session.shop,
    ...getEnvContext(context),
    ...ctx,
  };

  try {
    let result;
    switch (mode) {
      case "shopify":
        result = analyzeShopifyProduct(product, analyzerContext);
        break;
      case "etsy":
        result = analyzeEtsyProduct(product, analyzerContext);
        break;
      case "compliance":
        result = analyzeCompliance(product, analyzerContext);
        break;
      case "tagAudit":
        result = analyzeTagAudit(product, analyzerContext);
        break;
      case "full":
        result = analyzeFull(product, analyzerContext);
        break;
      default:
        return json({ error: "Unsupported mode" }, { status: 400 });
    }

    return json({ success: true, result });
  } catch (error: any) {
    console.error("Analyzer failure", error);
    return json({ error: error?.message || "Analyzer failed" }, { status: 500 });
  }
};
