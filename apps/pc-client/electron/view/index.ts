import path from 'node:path';
import process from 'node:process';
import { BrowserWindow } from 'electron';
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../env';

export class ViewManager {
  private static _instance: ViewManager | undefined;
  private _browserWindow: BrowserWindow | null = null;

  private constructor() {}

  createWindow() {
    this._browserWindow = new BrowserWindow({
      icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
      },
    });

    // Test active push message to Renderer-process.
    this._browserWindow.webContents.on('did-finish-load', () => {
      this._browserWindow?.webContents.send(
        'main-process-message',
        new Date().toLocaleString(),
      );
    });

    // win.webContents.openDevTools({ mode: 'detach' });

    if (VITE_DEV_SERVER_URL) {
      this._browserWindow?.loadURL(VITE_DEV_SERVER_URL);
    } else {
      // win.loadFile('dist/index.html')
      this._browserWindow?.loadFile(path.join(RENDERER_DIST, 'index.html'));
    }
  }

  destroy() {
    this._browserWindow = null;
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new ViewManager();
    }
    return this._instance;
  }
}
