import type { TAlgorithm } from 'jwt-simple';
import process from 'node:process';
import { logger } from './infra/logger';

const { env } = process;

const port = env.CRAWLER_SERVER_PORT;
if (!port) {
  logger.error('CRAWLER_SERVER_PORT is required');
  process.exit(1);
}
const allowOrigin = env.CRAWLER_SERVER_ALLOW_ORIGIN;
if (!allowOrigin) {
  logger.error('CRAWLER_SERVER_ALLOW_ORIGIN is required');
  process.exit(1);
}

const redisHost = env.REDIS_HOST;
const redisPort = env.REDIS_PORT;
const redisPassword = env.REDIS_PASSWORD;
// username 可选
const redisUsername = env.REDIS_USERNAME;
if (
  !redisHost ||
  !(redisPort && Number.parseInt(redisPort, 10)) ||
  !redisPassword
) {
  logger.error('REDIS_HOST, REDIS_PORT, REDIS_PASSWORD is required');
  process.exit(1);
}

const defaultLanguage = env.DEFAULT_LANGUAGE;

const jwtSecret = env.JWT_SECRET;
if (!jwtSecret) {
  logger.error('JWT_SECRET is required');
  process.exit(1);
}

const simplePasswordKey = env.CLIENT_SIMPLE_PASSWORD_KEY;
if (!simplePasswordKey) {
  logger.error('CLIENT_SIMPLE_PASSWORD_KEY is required');
  process.exit(1);
}

const config = {
  /** service port */
  port: Number.parseInt(port, 10),
  allowOrigin,
  defaultLanguage,
  redisHost,
  redisPort: Number.parseInt(redisPort, 10),
  redisPassword,
  redisUsername,

  /** jwt salt */
  jwtSecret,
  jwtAlgorithm: (env.JWT_ALGORITHM || 'HS256') as TAlgorithm,
  // token expires time, ms
  jwtTokenExpiresTime: env.JWT_TOKEN_EXPIRES_TIME
    ? Number.parseInt(env.JWT_TOKEN_EXPIRES_TIME, 10)
    : 1000 * 60 * 60 * 24 * 30, // 30 days

  /** 简单加密密码 */
  simplePasswordKey,
};

export default config;
