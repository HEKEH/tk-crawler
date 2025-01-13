/* eslint-disable perfectionist/sort-imports */
// env需要最先运行
import { initProxy, RENDERER_DIST, VITE_DEV_SERVER_URL } from './env';

import path from 'node:path';
import process from 'node:process';
import { setLogger } from '@tk-crawler/core';
// import { createRequire } from 'node:module'
import { app, BrowserWindow } from 'electron';
import { Crawler } from './domain';
import { logger } from './infra/logger';
import { ViewManager } from './view';

// const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

async function main() {
  setLogger(logger);
  await app.whenReady();
  ViewManager.getInstance().createWindow();

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      ViewManager.getInstance().createWindow();
    }
  });
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
      ViewManager.getInstance().destroy();
    }
  });
  await initProxy();
  const crawler = new Crawler();
  await crawler.start();
}

main();
