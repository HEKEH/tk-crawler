import type {
  AliasOptions,
  InlineConfig,
  PluginOption,
  UserConfig,
} from 'vite';
import type { ElectronSimpleOptions } from 'vite-plugin-electron/simple';
import { readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import process from 'node:process';
import { svgVueComponentPlugin } from '@tk-crawler/plugins';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import electron from 'vite-plugin-electron/simple';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const packageJson = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  );
  const external = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
  ];
  const alias: AliasOptions = {
    '@tk-follow-client/shared': resolve(__dirname, 'shared'),
    '@tk-crawler/shared': resolve(__dirname, '../../packages/shared/src'),
    '@tk-crawler/biz-shared': resolve(
      __dirname,
      '../../packages/biz-shared/src',
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

  const electronOptions: ElectronSimpleOptions = {
    main: {
      // Shortcut of `build.lib.entry`.
      entry: 'electron/main.ts',
      vite: {
        // assetsInclude: ['**/*.exe', '**/*.dll', '**/*.so', '**/*.node'],
        resolve: {
          alias,
        },
        build: {
          minify: isProduction,
          rollupOptions: {
            external,
          },
        },
        ...envConfig,
      } as InlineConfig,
    },
    preload: {
      // Shortcut of `build.rollupOptions.input`.
      // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
      input: path.join(__dirname, 'electron/preload.ts'),
    },
    // Ployfill the Electron and Node.js API for Renderer process.
    // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
    // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
    renderer:
      process.env.NODE_ENV === 'test'
        ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
          undefined
        : {},
  };
  const result: UserConfig = {
    plugins: [
      vue(),
      vueJsx() as PluginOption,
      svgVueComponentPlugin(),
      cssInjectedByJsPlugin({
        styleId: 'follow-client-style',
        relativeCSSInjection: true, // for multiple format
      }),
      createHtmlPlugin({
        pages: [
          {
            filename: 'index.html',
            template: 'index.html',
            injectOptions: {
              data: {
                title: packageJson.description,
              },
            },
          },
          {
            filename: 'tiktok-auto-follow-help.html',
            template: 'tiktok-auto-follow-help.html',
          },
          {
            filename: 'login-tiktok-help.html',
            template: 'login-tiktok-help.html',
          },
        ],
      }),
      (electron as any)(electronOptions),
    ],
    build: {
      minify: isProduction,
      outDir: 'dist',
      rollupOptions: {
        external,
        input: {
          main: path.resolve(__dirname, 'index.html'),
          'login-tiktok-help': path.resolve(
            __dirname,
            'login-tiktok-help.html',
          ),
          'collect-page-help': path.resolve(
            __dirname,
            'collect-page-help.html',
          ),
          'tiktok-auto-follow-help': path.resolve(
            __dirname,
            'tiktok-auto-follow-help.html',
          ),
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
