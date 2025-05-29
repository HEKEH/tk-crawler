import type { AliasOptions, UserConfig } from 'vite';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getCommonPostcssConfig,
  getCommonVitePlugins,
} from '@tk-crawler/build-and-deploy/index.mjs';
import { getCommonPackageAlias } from '@tk-crawler/build-and-deploy/package-alias.js';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

function getPagesConfig() {
  const pagesDir = resolve(__dirname, 'pages');
  const files = readdirSync(pagesDir);
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      filename: file,
      template: `pages/${file}`,
      injectOptions: {
        data: {
          title: file.replace('.html', ''),
        },
      },
    }));
}
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const packageJSON = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  );

  const alias: AliasOptions = getCommonPackageAlias(isProduction);

  const result: UserConfig = {
    publicDir: 'public',
    plugins: [
      ...getCommonVitePlugins({ packageJSON }),
      createHtmlPlugin({
        pages: [
          {
            filename: 'index.html',
            template: 'index.html',
            injectOptions: {
              data: {
                title: packageJSON.description,
              },
            },
          },
          ...getPagesConfig(),
        ],
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@tk-crawler/styles/mixins.scss" as *;
          `,
        },
      },
      postcss: getCommonPostcssConfig(),
    },
    server: {
      port: 7008,
      strictPort: true,
      host: true,
      open: true,
    },
    resolve: {
      alias,
    },
  };
  return result;
});
