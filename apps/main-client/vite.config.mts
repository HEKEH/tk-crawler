import type { AliasOptions, InlineConfig, UserConfig } from 'vite';
import type { ElectronSimpleOptions } from 'vite-plugin-electron/simple';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  CommonTerserOptions,
  getCommonVitePlugins,
} from '@tk-crawler/build-and-deploy/index.mjs';
import { getCommonPackageAlias } from '@tk-crawler/build-and-deploy/package-alias.js';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
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
  const alias: AliasOptions = getCommonPackageAlias(isProduction);
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
          minify: isProduction ? 'terser' : false,
          rollupOptions: {
            external,
          },
          terserOptions: CommonTerserOptions,
          sourcemap: false,
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
          {
            filename: 'guild-cookie-page-help.html',
            template: 'guild-cookie-page-help.html',
          },
        ],
      }),
      (electron as any)(electronOptions),
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
    build: {
      minify: isProduction ? 'terser' : false,
      outDir: 'dist',
      rollupOptions: {
        external,
        input: {
          main: path.resolve(__dirname, 'index.html'),
          'guild-cookie-page-help': path.resolve(
            __dirname,
            'guild-cookie-page-help.html',
          ),
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
