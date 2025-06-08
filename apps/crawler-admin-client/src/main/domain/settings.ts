import type { Settings } from '@tk-crawler-admin-client/shared';
import {
  DefaultSettings,
  SETTINGS_EVENTS,
} from '@tk-crawler-admin-client/shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import { deepToRaw } from '@tk-crawler/view-shared';
import { localStorageStore } from '../utils';

export class SettingsManage {
  private _settings: Settings = DefaultSettings;

  async init() {
    let settings: Settings | undefined;
    if (isInElectronApp()) {
      try {
        settings = await window.ipcRenderer.invoke(
          SETTINGS_EVENTS.GET_SETTINGS,
        );
      } catch (error) {
        console.error('Failed to get settings:', error);
      }
    } else {
      settings = localStorageStore.getItem<Settings | undefined>(
        'local-settings',
      );
    }
    this._settings = settings ?? DefaultSettings;
  }

  get settings() {
    return this._settings;
  }

  async setSettings(value: Settings) {
    this._settings = value;
    if (isInElectronApp()) {
      await window.ipcRenderer.invoke(
        SETTINGS_EVENTS.SET_SETTINGS,
        deepToRaw(value),
      );
    } else {
      localStorageStore.setItem('local-settings', deepToRaw(value));
    }
  }
}
