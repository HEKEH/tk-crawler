import process from 'node:process';
import { logger } from './infra/logger';

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
