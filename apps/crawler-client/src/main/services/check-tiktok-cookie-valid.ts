import { CUSTOM_EVENTS } from '../constants';

export function checkTiktokCookieValid(): Promise<boolean> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.CHECK_COOKIE_VALIDITY);
}
