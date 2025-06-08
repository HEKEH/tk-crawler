import { join } from 'node:path';
import process from 'node:process';
import {
  getExtraResourcesPath,
  getTrayManager,
} from '@tk-crawler/electron-utils/main';
import { SoundPlayer } from '@tk-crawler/node-shared';
import { isDevelopment } from '../../env';
import { logger } from '../../infra';
import { getSettings } from '../services/settings';

export class ErrorManager {
  private _hasGuildUserError = false;

  constructor() {}

  private _shouldErrorSoundPlay(errorSoundTime: [number, number] | undefined) {
    if (!errorSoundTime) {
      return false;
    }
    const now = new Date();
    const beijingTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }),
    );
    const hour = beijingTime.getHours();
    if (errorSoundTime[0] < errorSoundTime[1]) {
      return hour >= errorSoundTime[0] && hour < errorSoundTime[1];
    }
    return hour >= errorSoundTime[0] || hour <= errorSoundTime[1];
  }

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
    const errorSoundTime = getSettings().error_sound_time;
    if (hasError && this._shouldErrorSoundPlay(errorSoundTime)) {
      const soundPath = join(
        getExtraResourcesPath(isDevelopment),
        'sounds',
        'error.mp3',
      );
      SoundPlayer.getInstance().play({
        soundPath,
        logger,
        times: 3,
      });
    }
  }

  destroy() {
    this._hasGuildUserError = false;
    const trayManager = getTrayManager();
    trayManager.showNormal();
  }
}
