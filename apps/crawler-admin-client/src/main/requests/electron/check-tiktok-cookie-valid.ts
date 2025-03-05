import type { IsCookieValidResult } from '@tk-crawler-admin-client/shared';
import { CUSTOM_EVENTS } from '../../constants';

export function checkTiktokCookieValid(): Promise<IsCookieValidResult> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY);
}
