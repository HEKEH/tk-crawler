import type { IsCookieValidResult } from '@tk-follow-client/shared';
import { CUSTOM_EVENTS } from '../constants';

export function checkTiktokCookieValid(): Promise<IsCookieValidResult> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY);
}
