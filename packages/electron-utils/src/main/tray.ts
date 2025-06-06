import type { Logger } from '@tk-crawler/shared';
import type { NativeImage } from 'electron';
import process from 'node:process';
import { app, Menu, nativeImage, Tray } from 'electron';
import { showWindow } from './show-window';

let trayManager: TrayManager | null = null;

interface TrayManagerProps {
  logger: Logger;
  iconPath: string;
  transparentIconPath?: string;
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
  private _transparentIconPath?: string;
  private _currentIconPath?: string;
  private _logger: Logger;
  private _projectName: string;
  private _status: 'normal' | 'warning' | 'shining' = 'normal';
  private _contextMenuOptions?: Array<
    Electron.MenuItemConstructorOptions | Electron.MenuItem
  >;

  private _shiningInterval: NodeJS.Timeout | null = null;
  private _nativeImageMap: Record<string, NativeImage> = {};

  constructor(props: TrayManagerProps) {
    this._logger = props.logger;
    this._iconPath = props.iconPath;
    this._warningIconPath = props.warningIconPath;
    this._transparentIconPath = props.transparentIconPath;
    this._projectName = props.projectName;
    this._contextMenuOptions = props.contextMenuOptions;
  }

  private _getTrayImage(iconPath: string) {
    let image: string | NativeImage = iconPath;
    if (process.platform === 'darwin') {
      if (this._nativeImageMap[iconPath]) {
        image = this._nativeImageMap[iconPath];
      } else {
        image = nativeImage.createFromPath(iconPath);
        image.setTemplateImage(true);
        this._nativeImageMap[iconPath] = image;
      }
    }
    return image;
  }

  private _setCurrentIconPath(iconPath: string) {
    this._currentIconPath = iconPath;
    this._tray.setImage(this._getTrayImage(iconPath));
  }

  init() {
    this._currentIconPath = this._iconPath;
    this._tray = new Tray(this._getTrayImage(this._currentIconPath));
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
    });
  }

  private _clearShining() {
    if (this._shiningInterval) {
      clearInterval(this._shiningInterval);
      this._shiningInterval = null;
    }
  }

  showShining() {
    if (this._status === 'shining') {
      return;
    }
    this._status = 'shining';
    this._logger.info('showShining');
    if (!this._tray || this._tray.isDestroyed() || !this._iconPath) {
      return;
    }
    if (!this._transparentIconPath) {
      throw new Error('transparentIconPath is not set');
    }
    this._shiningInterval = setInterval(() => {
      this._setCurrentIconPath(
        this._iconPath === this._currentIconPath
          ? this._transparentIconPath!
          : this._iconPath,
      );
    }, 600);
  }

  showWarning() {
    if (this._status === 'warning') {
      return;
    }
    this._clearShining();
    this._status = 'warning';
    this._logger.info('showWarning');
    if (!this._tray || this._tray.isDestroyed() || !this._warningIconPath) {
      return;
    }
    this._setCurrentIconPath(this._warningIconPath);
  }

  showNormal() {
    if (this._status === 'normal') {
      return;
    }
    this._clearShining();
    this._status = 'normal';
    this._logger.info('showNormal');
    if (!this._tray || this._tray.isDestroyed() || !this._iconPath) {
      return;
    }
    this._setCurrentIconPath(this._iconPath);
  }

  destroy() {
    this._clearShining();
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
