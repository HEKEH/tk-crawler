import { resolve } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  clean: true,
  minify: true,
  tsconfig: '../../tsconfig.node.json',
  external: ['xbogus', 'jsdom', 'canvas'],
  noExternal: ['@tk-crawler/core'],
  esbuildOptions(options) {
    options.alias = {
      '@tk-crawler/core': resolve(__dirname, '../../packages/core/src'),
    };
  },
});
