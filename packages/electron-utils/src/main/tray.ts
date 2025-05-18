import type { Logger } from '@tk-crawler/shared';
import process from 'node:process';
import { app, Menu, Tray } from 'electron';
import { showWindow } from './show-window';

let trayManager: TrayManager | null = null;

interface TrayManagerProps {
  logger: Logger;
  iconPath: string;
  warningIconPath?: string;
  projectName: string;
  contextMenuOptions?: Array<
    Electron.MenuItemConstructorOptions | Electron.MenuItem
  >;
}

class TrayManager {
  private _tray!: Tray;
  private _iconPath: string;
  private _warningIconPath?: string;
  private _logger: Logger;
  private _projectName: string;
  private _status: 'normal' | 'warning' = 'normal';
  private _contextMenuOptions?: Array<
    Electron.MenuItemConstructorOptions | Electron.MenuItem
  >;

  constructor(props: TrayManagerProps) {
    this._logger = props.logger;
    this._iconPath = props.iconPath;
    this._warningIconPath = props.warningIconPath;
    this._projectName = props.projectName;
    this._contextMenuOptions = props.contextMenuOptions;
  }

  init() {
    this._tray = new Tray(this._iconPath);
    this._tray.setToolTip(this._projectName);
    const contextMenu = Menu.buildFromTemplate(
      this._contextMenuOptions || [
        {
          label: `打开面板`,
          toolTip: this._projectName,
          click: () => {
            showWindow(this._logger);
          },
        },
        { type: 'separator' },
        {
          label: '退出应用',
          click: () => {
            app.quit();
          },
        },
      ],
    );
    this._tray.setContextMenu(contextMenu);
    this._tray.on('click', () => {
      if (process.platform === 'win32') {
        showWindow(this._logger);
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
  }

  showWarning() {
    if (this._status === 'warning') {
      return;
    }
    this._status = 'warning';
    this._logger.info('showWarning');
    if (!this._tray || this._tray.isDestroyed() || !this._warningIconPath) {
      return;
    }
    this._tray.setImage(this._warningIconPath);
  }

  showNormal() {
    if (this._status === 'normal') {
      return;
    }
    this._status = 'normal';
    this._logger.info('showNormal');
    if (!this._tray || this._tray.isDestroyed() || !this._iconPath) {
      return;
    }
    this._tray.setImage(this._iconPath);
  }

  destroy() {
    if (this._tray) {
      this._tray.destroy();
    }
  }
}

export function createTrayManager(props: TrayManagerProps) {
  if (trayManager) {
    throw new Error('TrayManager is already initialized');
  }
  trayManager = new TrayManager(props);
  return trayManager;
}

export function getTrayManager() {
  if (!trayManager) {
    throw new Error('TrayManager is not initialized');
  }
  return trayManager;
}
