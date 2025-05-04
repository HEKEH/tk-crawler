import { secureObject } from '@tk-crawler/secure';

const ownServerUrl = import.meta.env.CLIENT_OWN_SERVER_URL;
if (!ownServerUrl) {
  throw new Error('CLIENT_OWN_SERVER_URL is required');
}

const simplePasswordKey = import.meta.env.CLIENT_SIMPLE_PASSWORD_KEY;
if (!simplePasswordKey) {
  throw new Error('CLIENT_SIMPLE_PASSWORD_KEY is required');
}

const enableDataDownload = import.meta.env.CLIENT_ENABLE_DATA_DOWNLOAD === '1';
interface Config {
  ownServerUrl: string;
  simplePasswordKey: string;
  enableDataDownload: boolean;
}
const config: Config = {} as Config;

secureObject(
  config,
  ['ownServerUrl', 'simplePasswordKey', 'enableDataDownload'],
  [ownServerUrl, simplePasswordKey, enableDataDownload],
);

export default config;
