import process from 'node:process';
import { getLogger } from 'log4js';

const { env } = process;
const logLevel = env.SERVER_LOG_LEVEL;
if (!logLevel) {
  throw new Error('SERVER_LOG_LEVEL is required');
}
const logger = getLogger();
logger.level = logLevel;
export { logger };
