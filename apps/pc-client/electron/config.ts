import path from 'node:path';
import process from 'node:process';
import { logger } from './infra/logger';

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

// @ts-expect-error vite使用
const crawlerInterval = import.meta.env.CLIENT_CRAWLER_INTERVAL;
if (!crawlerInterval) {
  logger.error('CLIENT_CRAWLER_INTERVAL is required');
  process.exit(1);
}

const config = {
  crawlerInterval: Number.parseInt(crawlerInterval, 10),
  /** mongodb url */
  // mongoDBUrl: env.MONGO_DB_URL || 'mongodb://localhost:27017/yx-chat',
  // adminUser: env.ADMIN_USER,
  // adminPassword: env.ADMIN_PASSWORD,
};
export default config;
