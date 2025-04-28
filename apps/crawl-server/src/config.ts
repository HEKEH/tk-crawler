import process from 'node:process';
import { logger } from './infra/logger';

const { env } = process;

const port = env.CRAWL_SERVER_PORT;
if (!port) {
  logger.error('CRAWL_SERVER_PORT is required');
  process.exit(1);
}
const allowOrigin = env.CRAWL_SERVER_ALLOW_ORIGIN;
if (!allowOrigin) {
  logger.error('CRAWL_SERVER_ALLOW_ORIGIN is required');
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

const guildUserWarningLimit = env.GUILD_USER_WARNING_LIMIT;
if (!guildUserWarningLimit) {
  logger.error('GUILD_USER_WARNING_LIMIT is required');
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
  guildUserWarningLimit: Number.parseInt(guildUserWarningLimit, 10),
};

export default config;
