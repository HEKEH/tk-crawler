// // @ts-expect-error vite使用
// export const CLIENT_OWN_SERVER_URL = import.meta.env.CLIENT_OWN_SERVER_URL;
// if (!CLIENT_OWN_SERVER_URL) {
//   logger.error('CLIENT_OWN_SERVER_URL is required');
//   process.exit(1);
// }

const config = {
  // ownServerUrl: CLIENT_OWN_SERVER_URL,
};
export default config;
