import {
  MAIN_APP_PRODUCT_NAME,
  MAIN_APP_PUBLISH_URL,
} from '@tk-crawler/main-client-shared';

export function getAppDownloadUrl(platform: 'Windows' | 'Mac') {
  if (platform === 'Windows') {
    return `${MAIN_APP_PUBLISH_URL}/${MAIN_APP_PRODUCT_NAME}-Windows-Installer.exe`;
  }
  if (platform === 'Mac') {
    return `${MAIN_APP_PUBLISH_URL}/${MAIN_APP_PRODUCT_NAME}-Mac-Installer.dmg`;
  }
  throw new Error(`Unsupported platform: ${platform}`);
}
