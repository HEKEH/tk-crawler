import type { AliasOptions, UserConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

export default defineConfig(() => {
  const pkg = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  );

  const alias: AliasOptions = {
    '@tk-crawler/shared': resolve(__dirname, '../shared/src'),
  };

  const config: UserConfig = {
    plugins: [
      // dts({
      //   outDir: 'dist',
      //   tsconfigPath: '../../tsconfig.node.json',
      //   rollupTypes: true,
      //   copyDtsFiles: true,
      // }),
    ],
    build: {
      minify: false,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'TKCrawlerCore',
        formats: ['es', 'cjs'],
        fileName: format => `index.${format}.js`,
      },
      rollupOptions: {
        external: [
          ...Object.keys(pkg.dependencies || {}),
          /^node:/,
          /^tk-crack\/*/,
        ],
      },
      sourcemap: false,
    },
    resolve: {
      alias,
    },
  };
  return config;
});
