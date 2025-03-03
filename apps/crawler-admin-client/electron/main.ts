/* eslint-disable perfectionist/sort-imports */
// env需要最先运行
import { initProxy, RENDERER_DIST, VITE_DEV_SERVER_URL } from './env';

import path from 'node:path';
import process from 'node:process';
import { setLogger } from '@tk-crawler/core';
// import { createRequire } from 'node:module'
import { app, BaseWindow } from 'electron';
import { logger } from './infra/logger';
import { GlobalManager } from './domain';
import { setElectronLang } from '@tk-crawler/electron-utils/main';

// const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

async function main() {
  setLogger(logger);
  setElectronLang('en-US');
  await app.whenReady();
  await initProxy();
  const globalManager = GlobalManager.getInstance();
  await globalManager.start();

  app.on('activate', async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BaseWindow.getAllWindows().length === 0) {
      await globalManager.start();
    }
  });
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
      globalManager.destroy();
    }
  });
}

main();
