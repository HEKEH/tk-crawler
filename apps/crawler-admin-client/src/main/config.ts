const CLIENT_OWN_SERVER_URL = import.meta.env.CLIENT_OWN_SERVER_URL;
if (!CLIENT_OWN_SERVER_URL) {
  throw new Error('CLIENT_OWN_SERVER_URL is required');
}

const simplePasswordKey = import.meta.env.CLIENT_SIMPLE_PASSWORD_KEY;
if (!simplePasswordKey) {
  throw new Error('CLIENT_SIMPLE_PASSWORD_KEY is required');
}

if (!import.meta.env.CLIENT_ADMIN_DEFAULT_WRITE_LOG) {
  throw new Error('CLIENT_ADMIN_DEFAULT_WRITE_LOG is required');
}

const defaultWriteLog = import.meta.env.CLIENT_ADMIN_DEFAULT_WRITE_LOG === '1';

const config = {
  ownServerUrl: CLIENT_OWN_SERVER_URL,
  simplePasswordKey,
  defaultWriteLog,
};
export default config;
