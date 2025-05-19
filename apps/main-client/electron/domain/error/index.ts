import { getTrayManager } from '@tk-crawler/electron-utils/main';

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
  }

  destroy() {
    this._hasGuildUserError = false;
    const trayManager = getTrayManager();
    trayManager.showNormal();
  }
}
