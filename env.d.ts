/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

interface ImportMetaEnv {
  readonly VITE_SERPAPI_API_KEY?: string;
  readonly SERPAPI_KEY?: string;
  readonly GOOGLE_TRENDS_GEO?: string;
  readonly GOOGLE_TRENDS_LANGUAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
