import process from 'node:process';
import { logger } from '../infra/logger';

const { env } = process;

const port = env.CRAWLER_PORT;
if (!port) {
  logger.error('CRAWLER_PORT is required');
  process.exit(1);
}
const allowOrigin = env.ALLOW_ORIGIN;
if (!allowOrigin) {
  logger.error('ALLOW_ORIGIN is required');
  process.exit(1);
}

const crawlerInterval = env.CRAWLER_INTERVAL;
if (!crawlerInterval) {
  logger.error('CRAWLER_INTERVAL is required');
  process.exit(1);
}

const config = {
  port: Number.parseInt(port, 10),
  allowOrigin,
  crawlerInterval: Number.parseInt(crawlerInterval, 10),
  /** mongodb url */
  // mongoDBUrl: env.MONGO_DB_URL || 'mongodb://localhost:27017/yx-chat',
  // adminUser: env.ADMIN_USER,
  // adminPassword: env.ADMIN_PASSWORD,
};

export default config;
