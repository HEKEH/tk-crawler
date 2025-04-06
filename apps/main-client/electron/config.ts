import process from 'node:process';
import { logger } from './infra/logger';

// @ts-expect-error vite使用
export const CLIENT_OWN_SERVER_URL = import.meta.env.CLIENT_OWN_SERVER_URL;
if (!CLIENT_OWN_SERVER_URL) {
  logger.error('CLIENT_OWN_SERVER_URL is required');
  process.exit(1);
}

// @ts-expect-error vite使用
export const CLIENT_MAIN_WEB_URL = import.meta.env.CLIENT_MAIN_WEB_URL;
if (!CLIENT_MAIN_WEB_URL) {
  logger.error('CLIENT_MAIN_WEB_URL is required');
  process.exit(1);
}

const config = {
  ownServerUrl: CLIENT_OWN_SERVER_URL as string,
  mainWebUrl: CLIENT_MAIN_WEB_URL as string,
};
export default config;
