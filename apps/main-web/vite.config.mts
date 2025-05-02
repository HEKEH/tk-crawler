import type { AliasOptions, PluginOption, UserConfig } from 'vite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import {
  CommonPackageAlias,
  CommonTerserOptions,
} from '@tk-crawler/build-and-deploy';
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
  const alias: AliasOptions = CommonPackageAlias;

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
      tailwindcss(),
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
      minify: isProduction ? 'terser' : false,
      outDir: 'dist',
      rollupOptions: {
        external,
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
      terserOptions: CommonTerserOptions,
      target: 'es2015',
      sourcemap: false,
    },
    resolve: {
      alias,
    },
    ...envConfig,
  };
  return result;
});
