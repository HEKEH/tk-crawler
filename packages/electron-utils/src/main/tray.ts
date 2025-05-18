import type { Logger } from '@tk-crawler/shared';
import process from 'node:process';
import { app, Menu, Tray } from 'electron';
import { showWindow } from './show-window';

export async function initTray({
  logger,
  iconPath,
  projectName,
}: {
  logger: Logger;
  iconPath: string;
  projectName: string;
}) {
  const tray = new Tray(iconPath);

  // 根据平台设置不同的菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `打开面板`,
      toolTip: projectName,
      click: () => {
        showWindow(logger);
      },
    },
    { type: 'separator' },
    {
      label: '退出应用',
      click: () => {
        app.quit();
      },
    },
  ]);

  // 设置托盘图标
  tray.setToolTip(projectName);
  tray.setContextMenu(contextMenu);

  // 点击托盘图标时的行为
  tray.on('click', () => {
    if (process.platform === 'win32') {
      showWindow(logger);
    }
    // const windows = BaseWindow.getAllWindows();
    // if (windows.length > 0) {
    //   if (process.platform === 'win32') {
    //     // Windows: 切换窗口显示/隐藏
    //     if (windows[0].isVisible()) {
    //       windows[0].hide();
    //     } else {
    //       windows[0].show();
    //     }
    //   } else {
    //     // macOS: 显示窗口并聚焦
    //     windows[0].show();
    //     windows[0].focus();
    //   }
    // } else {
    //   showWindow(logger);
    // }
  });
  return tray;
}
