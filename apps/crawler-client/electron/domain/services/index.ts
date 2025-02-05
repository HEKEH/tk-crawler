import type { Crawler } from '../crawler';
import type { ViewManager } from '../view';
import { checkTiktokCookieValid, getQueryTokens } from '@tk-crawler/core';
import { ipcMain } from 'electron';
import { CUSTOM_EVENTS } from '../../constants';
import { syncTiktokCookie } from './cookie';

export class Services {
  private _crawler: Crawler;
  private _viewManager: ViewManager;
  constructor({
    crawler,
    viewManager,
  }: {
    crawler: Crawler;
    viewManager: ViewManager;
  }) {
    this._crawler = crawler;
    this._viewManager = viewManager;
  }

  init() {
    syncTiktokCookie();
    ipcMain.handle(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY, async () => {
      const queryTokens = getQueryTokens();
      const isCookieValid = await checkTiktokCookieValid({
        tokens: queryTokens,
      });
      return isCookieValid;
    });
    ipcMain.handle(CUSTOM_EVENTS.OPEN_TIKTOK_LOGIN_PAGE, async () => {
      this._viewManager.openTkLoginPage();
    });
  }

  destroy() {
    ipcMain.removeHandler(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY);
    ipcMain.removeHandler(CUSTOM_EVENTS.OPEN_TIKTOK_LOGIN_PAGE);
  }
}
