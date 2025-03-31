const ownServerUrl = import.meta.env.CLIENT_OWN_SERVER_URL;
if (!ownServerUrl) {
  throw new Error('CLIENT_OWN_SERVER_URL is required');
}

const simplePasswordKey = import.meta.env.CLIENT_SIMPLE_PASSWORD_KEY;
if (!simplePasswordKey) {
  throw new Error('CLIENT_SIMPLE_PASSWORD_KEY is required');
}

const config = {
  ownServerUrl,
  simplePasswordKey,
};
export default config;
