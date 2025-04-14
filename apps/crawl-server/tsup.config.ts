import { resolve } from 'node:path';
import { defineConfig } from 'tsup';

/** 如果rollup打包出错，暂时换回tsup打包 */
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
      '@tk-crawler/tk-requests': resolve(
        __dirname,
        '../../packages/tk-requests/src',
      ),
      '@tk-crawler/server-shared': resolve(
        __dirname,
        '../../packages/server-shared/src',
      ),
    };
  },
});
