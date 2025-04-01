/* eslint-disable perfectionist/sort-imports */
// env需要最先运行
import { initProxy } from './env';

import process from 'node:process';
// import { createRequire } from 'node:module'
import {
  AutoUpdater,
  getAppInstallUrl,
  setElectronLang,
} from '@tk-crawler/electron-utils/main';
import { PRODUCT_NAME, PUBLISH_URL } from '@tk-follow-client/shared';
import { app, BaseWindow } from 'electron';
import { GlobalManager } from './domain';
import { logger } from './infra/logger';

// const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  setElectronLang('en-US');
  const autoUpdater = new AutoUpdater(
    logger,
    getAppInstallUrl(PRODUCT_NAME, PUBLISH_URL),
  );
  await app.whenReady();
  await initProxy();
  const globalManager = GlobalManager.getInstance();
  await globalManager.start();

  autoUpdater.checkForUpdates();

  app.on('activate', async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BaseWindow.getAllWindows().length === 0) {
      await globalManager.start();
    }
    autoUpdater.checkForUpdates();
  });
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      globalManager.destroy();
      app.quit();
    }
  });
}

main();
