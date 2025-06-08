import type { Settings } from '@tk-crawler-admin-client/shared';
import {
  getDefaultSettings,
  SETTINGS_EVENTS,
} from '@tk-crawler-admin-client/shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import { deepToRaw } from '@tk-crawler/view-shared';
import { ElMessage } from 'element-plus';
import config from '../config';
import { localStorageStore } from '../utils';

const defaultSettings = getDefaultSettings({
  defaultWriteLog: config.defaultWriteLog,
});

export class SettingsManage {
  private _settings: Settings = defaultSettings;

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
    this._settings = settings ?? defaultSettings;
  }

  get settings() {
    return this._settings;
  }

  async setSettings(value: Settings) {
    this._settings = value;
    if (isInElectronApp()) {
      try {
        await window.ipcRenderer.invoke(
          SETTINGS_EVENTS.SET_SETTINGS,
          deepToRaw(value),
        );
      } catch (error) {
        console.error('Failed to set settings:', error);
        ElMessage.error('保存失败，请将软件更新到最新版本后重试');
      }
    } else {
      localStorageStore.setItem('local-settings', deepToRaw(value));
    }
  }
}
