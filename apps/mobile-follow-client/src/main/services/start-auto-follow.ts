import { CUSTOM_EVENTS } from '../constants';

export function startAutoFollow(userIds: string[]): Promise<void> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.START_AUTO_FOLLOW, userIds);
}
