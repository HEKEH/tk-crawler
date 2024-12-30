import process from 'node:process';
import { logger } from './logger';

const { env } = process;

const port = env.SERVER_PORT;
if (!port) {
  logger.error('SERVER_PORT is required');
  process.exit(1);
}
const allowOrigin = env.ALLOW_ORIGIN;
if (!allowOrigin) {
  logger.error('ALLOW_ORIGIN is required');
  process.exit(1);
}

const config = {
  /** service port */
  port: Number.parseInt(port, 10),
  allowOrigin,
  /** mongodb url */
  // mongoDBUrl: env.MONGO_DB_URL || 'mongodb://localhost:27017/yx-chat',
  // adminUser: env.ADMIN_USER,
  // adminPassword: env.ADMIN_PASSWORD,
};

// console.log('config', config);

export default config;
