import { join } from 'node:path';
import process from 'node:process';
import {
  getExtraResourcesPath,
  getTrayManager,
} from '@tk-crawler/electron-utils/main';
import { SoundPlayer } from '@tk-crawler/node-shared';
import { isDevelopment } from '../../env';
import { logger } from '../../infra';

export class ErrorManager {
  private _hasGuildUserError = false;

  constructor() {}

  init() {}

  setHasGuildUserError(hasError: boolean) {
    if (this._hasGuildUserError === hasError) {
      return;
    }
    this._hasGuildUserError = hasError;
    const trayManager = getTrayManager();
    if (hasError) {
      if (process.platform === 'darwin') {
        trayManager.showWarning();
      } else {
        trayManager.showShining();
      }
    } else {
      trayManager.showNormal();
    }
    if (hasError) {
      const soundPath = join(
        getExtraResourcesPath(isDevelopment),
        'sounds',
        'error.mp3',
      );
      SoundPlayer.getInstance().play({
        soundPath,
        logger,
      });
    }
  }

  destroy() {
    this._hasGuildUserError = false;
    const trayManager = getTrayManager();
    trayManager.showNormal();
  }
}
