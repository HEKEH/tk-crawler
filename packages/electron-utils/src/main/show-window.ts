import type { Logger } from '@tk-crawler/shared';
import { app, BaseWindow } from 'electron';

export async function showWindow(logger: Logger) {
  logger.info('showWindow');
  let win = BaseWindow.getAllWindows()[0];

  if (!win) {
    logger.info('No window found, activating app');
    app.emit('activate');
    // 等待窗口创建
    await new Promise<void>(resolve => {
      let remainRetry = 30;
      const checkWindow = setInterval(() => {
        win = BaseWindow.getAllWindows()[0];
        if (win) {
          clearInterval(checkWindow);
          resolve();
        }
        if (remainRetry <= 0) {
          clearInterval(checkWindow);
          resolve();
        }
        remainRetry--;
      }, 100);
    });
  }

  if (win) {
    logger.info('window found');
    // 如果窗口最小化了，恢复它
    if (win.isMinimized()) {
      win.restore();
    }

    // 显示窗口
    win.show();

    // 将窗口置顶
    win.moveTop();

    // 激活窗口(获得焦点)
    win.focus();

    logger.info('show app');
    app.show();
    app.focus();
  }
}

export async function bindShowWindowEvents(logger: Logger) {
  // 在协议处理函数中调用
  app.on('open-url', event => {
    logger.info('open-url event');
    event.preventDefault();
    showWindow(logger);
  });

  // Windows下的处理
  app.on('second-instance', (_, commandLine) => {
    logger.info('second-instance event');
    const url = commandLine.pop();
    if (url) {
      showWindow(logger);
    }
  });
}
