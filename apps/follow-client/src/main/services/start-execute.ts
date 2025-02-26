import { CUSTOM_EVENTS } from '../constants';

export function startExecute(userIds: string[]): Promise<void> {
  return window.ipcRenderer.invoke(CUSTOM_EVENTS.START_EXECUTE, userIds);
}
