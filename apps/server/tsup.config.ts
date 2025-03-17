import { resolve } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  minify: false,
  clean: false,
  esbuildOptions(options) {
    options.alias = {
      '@tk-crawler/shared': resolve(__dirname, '../../packages/shared/src'),
      '@tk-crawler/biz-shared': resolve(
        __dirname,
        '../../packages/biz-shared/src',
      ),
    };
  },
});
