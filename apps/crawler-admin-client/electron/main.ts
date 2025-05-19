/* eslint-disable perfectionist/sort-imports */
// env需要最先运行
import './env';

import { setLogger as setCoreLogger } from '@tk-crawler/core';
import { setLogger as setTkRequestsLogger } from '@tk-crawler/tk-requests';
import process from 'node:process';
// import { createRequire } from 'node:module'
import {
  APP_ID,
  PRODUCT_NAME,
  PUBLISH_URL,
} from '@tk-crawler-admin-client/shared';
import {
  AutoUpdater,
  bindShowWindowEvents,
  createTrayManager,
  getAppInstallUrl,
  initProxy,
  setElectronLang,
} from '@tk-crawler/electron-utils/main';
import { app, BaseWindow } from 'electron';
import { join } from 'node:path';
import { GlobalManager } from './domain';
import { logger } from './infra';

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
    if (!gotTheLock) {
      logger.error('App quit by requestSingleInstanceLock');
      app.quit();
      return;
    }
    if (process.platform === 'win32') {
      // windows上设置为默认协议客户端
      app.setAsDefaultProtocolClient(APP_ID);
    }

    bindShowWindowEvents(logger);
  }
  setCoreLogger(logger);
  setTkRequestsLogger(logger);
  setElectronLang('en-US');
  const autoUpdater = new AutoUpdater(
    logger,
    getAppInstallUrl(PRODUCT_NAME, PUBLISH_URL),
  );
  await app.whenReady();

  const appPath = app.getAppPath();
  const iconPath =
    process.platform === 'win32'
      ? join(appPath, 'assets/tray-icon.ico') // Windows 使用 .ico
      : join(appPath, 'assets/tray-icon@2x.png'); // macOS 使用 .png
  const warningIconPath =
    process.platform === 'win32'
      ? join(appPath, 'assets/tray-icon-warning.ico') // Windows 使用 .ico
      : join(appPath, 'assets/tray-icon-warning@2x.png'); // macOS 使用 .png
  const trayManager = createTrayManager({
    logger,
    iconPath,
    warningIconPath,
    projectName: PRODUCT_NAME,
  });
  trayManager.init();

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
    trayManager.destroy();
    globalManager.destroy();
    if (proxyInterval) {
      clearInterval(proxyInterval);
      proxyInterval = undefined;
    }
  });
}

main();
