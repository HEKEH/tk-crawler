import process from 'node:process';
import { logger } from './infra/logger';

// @ts-expect-error vite使用
const crawlerInterval = import.meta.env.CLIENT_CRAWLER_INTERVAL;
if (!crawlerInterval) {
  logger.error('CLIENT_CRAWLER_INTERVAL is required');
  process.exit(1);
}

// @ts-expect-error vite使用
const CLIENT_OWN_SERVER_URL = import.meta.env.CLIENT_OWN_SERVER_URL;
if (!CLIENT_OWN_SERVER_URL) {
  logger.error('CLIENT_OWN_SERVER_URL is required');
  process.exit(1);
}

// @ts-expect-error vite使用
export const CLIENT_ADMIN_WEB_URL = import.meta.env.CLIENT_ADMIN_WEB_URL;
if (!CLIENT_ADMIN_WEB_URL) {
  logger.error('CLIENT_ADMIN_WEB_URL is required');
  process.exit(1);
}

const config = {
  crawlerInterval: Number.parseInt(crawlerInterval, 10),
  ownServerUrl: CLIENT_OWN_SERVER_URL,
  adminWebUrl: CLIENT_ADMIN_WEB_URL as string,
};
export default config;
