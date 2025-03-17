import { resolve } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  minify: true,
  clean: true,
  esbuildOptions(options) {
    options.alias = {
      '@tk-crawler/shared': resolve(__dirname, '../../packages/shared/src'),
      '@tk-crawler/biz-shared': resolve(
        __dirname,
        '../../packages/biz-shared/src',
      ),
      '@tk-crawler/database': resolve(__dirname, '../../packages/database/src'),
    };
  },
});
