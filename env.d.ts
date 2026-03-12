/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

interface ImportMetaEnv {
  readonly VITE_SERPAPI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
