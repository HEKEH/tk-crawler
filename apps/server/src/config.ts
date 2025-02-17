import type { TAlgorithm } from 'jwt-simple';
import process from 'node:process';
import { logger } from './infra/logger';

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

const defaultLanguage = env.DEFAULT_LANGUAGE;

const config = {
  /** service port */
  port: Number.parseInt(port, 10),
  allowOrigin,
  defaultLanguage,
  /** mongodb url */
  // mongoDBUrl: env.MONGO_DB_URL || 'mongodb://localhost:27017/yx-chat',
  // adminUser: env.ADMIN_USER,
  // adminPassword: env.ADMIN_PASSWORD,

  /** jwt salt */
  jwtSecret: env.JWT_SECRET || 'yx-tkc-jwt-0',
  jwtAlgorithm: (env.JWT_ALGORITHM || 'HS256') as TAlgorithm,
  // token expires time, ms
  jwtTokenExpiresTime: env.JWT_TOKEN_EXPIRES_TIME
    ? Number.parseInt(env.JWT_TOKEN_EXPIRES_TIME, 10)
    : 1000 * 60 * 60 * 24 * 30, // 30 days
};

export default config;
