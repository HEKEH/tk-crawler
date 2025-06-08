import type { Settings } from '@tk-crawler-admin-client/shared';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { getDefaultSettings, getSettingsPath } from '../../constants';
import { logger } from '../../infra';

let settings: Settings | undefined;

function getElectronDefaultSettings(): Settings {
  // @ts-expect-error vite使用
  if (!import.meta.env.CLIENT_ADMIN_DEFAULT_WRITE_LOG) {
    throw new Error('CLIENT_ADMIN_DEFAULT_WRITE_LOG is required');
  }
  const defaultWriteLog =
    // @ts-expect-error vite使用
    import.meta.env.CLIENT_ADMIN_DEFAULT_WRITE_LOG === '1';
  return getDefaultSettings({ defaultWriteLog });
}

export function getSettings(ignoreError = false): Settings {
  if (settings) {
    return settings;
  }
  const settingsPath = getSettingsPath();
  const defaultSettings = getElectronDefaultSettings();
  if (!existsSync(settingsPath)) {
    return defaultSettings;
  }
  try {
    let settingsStr = readFileSync(settingsPath, 'utf-8');
    settingsStr = settingsStr.trim();
    if (settingsStr) {
      settings = {
        ...defaultSettings,
        ...JSON.parse(settingsStr),
      };
      return settings!;
    }
    return defaultSettings;
  } catch (error) {
    if (ignoreError) {
      logger.error('Failed to get settings file:', error);
      throw error;
    }
    return defaultSettings;
  }
}

export function saveSettings(_settings: Settings) {
  settings = _settings;
  const settingsPath = getSettingsPath();
  if (!settingsPath) {
    throw new Error('Settings path is not set');
  }
  try {
    const dir = dirname(settingsPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(settingsPath, JSON.stringify(settings));
  } catch (error) {
    logger.error('Failed to save settings file:', error);
    throw error;
  }
}
