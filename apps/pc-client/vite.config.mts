import { readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import process from 'node:process';
import vue from '@vitejs/plugin-vue';
import { AliasOptions, defineConfig } from 'vite';
import electron, { ElectronSimpleOptions } from 'vite-plugin-electron/simple';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const pkg = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  );
  const alias: AliasOptions = {
    '@tk-crawler/core': resolve(__dirname, '../../packages/core/src'),
  };

  const electronOptions: ElectronSimpleOptions = {
    main: {
      // Shortcut of `build.lib.entry`.
      entry: 'electron/main.ts',
      vite: {
        resolve: {
          alias,
        },
        build: {
          rollupOptions: {
            output: {
              // 解决bug https://github.com/rollup/rollup/issues/5559
              externalLiveBindings: false,
            },
          },
        },
        envDir: path.resolve(__dirname, '../..'), // 环境文件目录
        envPrefix: ['CLIENT_'], // 环境变量前缀
        env: {
          envFile: `.env.${mode}`, // 指定环境文件名
        },
      },
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
  return {
    plugins: [
      vue(),
      createHtmlPlugin({
        inject: {
          data: {
            title: pkg.description,
          },
        },
      }),
      (electron as any)(electronOptions),
    ],
  };
});
