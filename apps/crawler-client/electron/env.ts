import path from 'node:path';

import process from 'node:process';

import { get as getSystemProxy } from 'get-system-proxy';

import { bootstrap } from 'global-agent';

export async function initProxy() {
  const proxy = await getSystemProxy();
  if (proxy) {
    const proxyUrl = `${proxy.type}://${proxy.host}:${proxy.port}`;
    process.env.GLOBAL_AGENT_HTTP_PROXY = proxyUrl;
    process.env.GLOBAL_AGENT_HTTPS_PROXY = proxyUrl;
    bootstrap();
  }
}

export const isDevelopment = process.defaultApp;
export const isProduction = !isDevelopment;
process.env.NODE_ENV = isDevelopment ? 'development' : 'production';

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;
