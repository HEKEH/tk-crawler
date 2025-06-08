import type { Settings } from '@tk-crawler-admin-client/shared';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DefaultSettings, getSettingsPath } from '../../constants';
import { logger } from '../../infra';

let settings: Settings | undefined;

export function getSettings(): Settings {
  if (settings) {
    return settings;
  }
  const settingsPath = getSettingsPath();
  if (!existsSync(settingsPath)) {
    return DefaultSettings;
  }
  try {
    let settingsStr = readFileSync(settingsPath, 'utf-8');
    settingsStr = settingsStr.trim();
    if (settingsStr) {
      settings = {
        ...DefaultSettings,
        ...JSON.parse(settingsStr),
      };
      return settings!;
    }
    return DefaultSettings;
  } catch (error) {
    logger.error('Failed to get settings file:', error);
    throw error;
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
  }
}
