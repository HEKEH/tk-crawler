/* eslint-disable perfectionist/sort-imports */
// env需要最先运行
import './env';

import { setLogger as setTkRequestsLogger } from '@tk-crawler/tk-requests';

import process from 'node:process';
// import { createRequire } from 'node:module'
import {
  AutoUpdater,
  bindShowWindowEvents,
  getAppInstallUrl,
  initProxy,
  setElectronLang,
} from '@tk-crawler/electron-utils/main';
import {
  MAIN_APP_ID,
  MAIN_APP_PRODUCT_NAME,
  MAIN_APP_PUBLISH_URL,
} from '@tk-crawler/main-client-shared';
import { app, BaseWindow } from 'electron';
import { GlobalManager } from './domain';
import { logger } from './infra/logger';

// const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  if (process.env.NODE_ENV === 'production') {
    const gotTheLock = app.requestSingleInstanceLock();
    logger.info('requestSingleInstanceLock', gotTheLock);
    if (!gotTheLock) {
      logger.info('App quit by requestSingleInstanceLock');
      app.quit();
      return;
    }

    if (process.platform === 'win32') {
      // windows上设置为默认协议客户端
      app.setAsDefaultProtocolClient(MAIN_APP_ID);
    }

    bindShowWindowEvents(logger);
  }
  setTkRequestsLogger(logger);
  setElectronLang('en-US');
  const autoUpdater = new AutoUpdater(
    logger,
    getAppInstallUrl(MAIN_APP_PRODUCT_NAME, MAIN_APP_PUBLISH_URL),
  );

  await app.whenReady();
  await initProxy(logger);
  let proxyInterval: NodeJS.Timeout | undefined = setInterval(
    () => initProxy(logger),
    1000 * 60 * 2, // 2分钟检查一次代理
  );

  const globalManager = GlobalManager.getInstance();
  await globalManager.start();

  autoUpdater.checkForUpdates();

  app.on('activate', async () => {
    logger.info('activate');
    await initProxy(logger);
    setTimeout(() => initProxy(logger), 1000 * 30); // 保险起见，30秒后再检查一次
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
    logger.info('window-all-closed');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  app.on('will-quit', () => {
    logger.info('will-quit');
    globalManager.destroy();
    if (proxyInterval) {
      clearInterval(proxyInterval);
      proxyInterval = undefined;
    }
  });
}

main();
