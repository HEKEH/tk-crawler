import { join } from 'node:path';
import { getTrayManager } from '@tk-crawler/electron-utils/main';
import { SoundPlayer } from '@tk-crawler/node-shared';
import { app } from 'electron';
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
      trayManager.showShining();
    } else {
      trayManager.showNormal();
    }
    if (hasError) {
      SoundPlayer.getInstance().play({
        soundPath: join(app.getAppPath(), 'assets/sounds/error.mp3'),
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
