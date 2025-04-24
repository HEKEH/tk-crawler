import type { AliasOptions, PluginOption, UserConfig } from 'vite';
import { readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import { svgVueComponentPlugin } from '@tk-crawler/plugins';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const packageJSON = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  );
  const external = [
    ...Object.keys(packageJSON.dependencies || {}),
    ...Object.keys(packageJSON.peerDependencies || {}),
  ];
  const alias: AliasOptions = {
    '@tk-crawler/shared': resolve(__dirname, '../../packages/shared/src'),
    '@tk-crawler/biz-shared': resolve(
      __dirname,
      '../../packages/biz-shared/src',
    ),
    '@tk-crawler/main-client-shared': resolve(
      __dirname,
      '../../packages/main-client-shared/src',
    ),
    '@tk-crawler/electron-utils': resolve(
      __dirname,
      '../../packages/electron-utils/src',
    ),
    '@tk-crawler/view-shared': resolve(
      __dirname,
      '../../packages/view-shared/src',
    ),
    '@tk-crawler/styles': resolve(__dirname, '../../packages/styles'),
    '@tk-crawler/assets': resolve(__dirname, '../../packages/assets'),
  };

  const envConfig = {
    envDir: path.resolve(__dirname, '../..'), // 环境文件目录
    envPrefix: ['CLIENT_'], // 环境变量前缀
  };

  const result: UserConfig = {
    publicDir: 'public',
    plugins: [
      vue(),
      vueJsx() as PluginOption,
      svgVueComponentPlugin(),
      cssInjectedByJsPlugin({
        styleId: 'main-web-style',
        relativeCSSInjection: true, // for multiple format
      }),
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
    },
    server: {
      port: 5002,
      strictPort: false,
      host: true,
      open: true,
    },
    build: {
      minify: isProduction,
      outDir: 'dist',
      rollupOptions: {
        external,
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
    resolve: {
      alias,
    },
    ...envConfig,
  };
  return result;
});
