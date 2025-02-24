import { CUSTOM_EVENTS } from '../constants';

export function openTiktokLoginPage(): Promise<boolean> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.OPEN_TIKTOK_LOGIN_PAGE);
}
