import { CUSTOM_EVENTS } from '../constants';

export function openTkPages(): Promise<boolean> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.OPEN_TIKTOK_PAGES);
}
