const CLIENT_OWN_SERVER_URL = import.meta.env.CLIENT_OWN_SERVER_URL;
if (!CLIENT_OWN_SERVER_URL) {
  throw new Error('CLIENT_OWN_SERVER_URL is required');
}

const config = {
  ownServerUrl: CLIENT_OWN_SERVER_URL,
};
export default config;
