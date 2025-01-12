/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CLIENT_CRAWLER_INTERVAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
