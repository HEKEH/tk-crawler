// Skip Husky install in production and CI
const process = require('node:process');

if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  process.exit(0);
}
(async () => {
  const husky = (await import('husky')).default;
  husky.install();
})();
