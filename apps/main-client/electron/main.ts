/* eslint-disable perfectionist/sort-imports */
// env需要最先运行
import { initProxy } from './env';
import { setLogger as setTkRequestsLogger } from '@tk-crawler/tk-requests';

import process from 'node:process';
// import { createRequire } from 'node:module'
import {
  AutoUpdater,
  getAppInstallUrl,
  setElectronLang,
} from '@tk-crawler/electron-utils/main';
import {
  MAIN_APP_PRODUCT_NAME,
  MAIN_APP_PUBLISH_URL,
} from '@tk-crawler/main-client-shared';
import { app, BaseWindow } from 'electron';
import { GlobalManager } from './domain';
import { logger } from './infra/logger';
import { setIntervalImmediate } from '@tk-crawler/shared';

// const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  setTkRequestsLogger(logger);
  setElectronLang('en-US');
  const autoUpdater = new AutoUpdater(
    logger,
    getAppInstallUrl(MAIN_APP_PRODUCT_NAME, MAIN_APP_PUBLISH_URL),
  );

  await app.whenReady();
  await initProxy();
  const globalManager = GlobalManager.getInstance();
  await globalManager.start();

  let autoUpdateCheckInterval: NodeJS.Timeout | null;
  const initAutoUpdateCheck = () => {
    autoUpdateCheckInterval = setIntervalImmediate(
      () => {
        autoUpdater.checkForUpdates();
      },
      1000 * 60 * 10, // 每10分钟检测一次
    );
  };
  initAutoUpdateCheck();

  app.on('activate', async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BaseWindow.getAllWindows().length === 0) {
      await globalManager.start();
    }
    if (!autoUpdateCheckInterval) {
      initAutoUpdateCheck();
    } else {
      autoUpdater.checkForUpdates();
    }
  });
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (autoUpdateCheckInterval) {
      clearInterval(autoUpdateCheckInterval);
      autoUpdateCheckInterval = null;
    }
    if (process.platform !== 'darwin') {
      globalManager.destroy();
      app.quit();
    }
  });
}

main();
