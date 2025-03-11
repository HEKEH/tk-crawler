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
};

export default config;
