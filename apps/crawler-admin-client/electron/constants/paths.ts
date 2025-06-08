import path from 'node:path';
import process from 'node:process';
import { app } from 'electron';
import { isProduction } from '../env';

export function getTiktokCookiePath() {
  if (isProduction) {
    return path.join(app.getPath('userData'), '.tiktok-cookies');
  }
  return path.join(process.cwd(), '.tiktok-cookies');
}

export function getTokenPath() {
  if (isProduction) {
    return path.join(app.getPath('userData'), '.system-admin-token');
  }
  return path.join(process.cwd(), '.system-admin-token');
}

export function getSettingsPath() {
  if (isProduction) {
    return path.join(app.getPath('userData'), '.admin-settings');
  }
  return path.join(process.cwd(), '.admin-settings');
}
