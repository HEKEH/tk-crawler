const ownServerUrl = import.meta.env.CLIENT_OWN_SERVER_URL;
if (!ownServerUrl) {
  throw new Error('CLIENT_OWN_SERVER_URL is required');
}

const simplePasswordKey = import.meta.env.CLIENT_SIMPLE_PASSWORD_KEY;
if (!simplePasswordKey) {
  throw new Error('CLIENT_SIMPLE_PASSWORD_KEY is required');
}

const enableDataDownload = import.meta.env.ENABLE_DATA_DOWNLOAD === '1';

const config = {
  ownServerUrl,
  simplePasswordKey,
  enableDataDownload,
};
export default config;
