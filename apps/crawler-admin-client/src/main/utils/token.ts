import { TOKEN_EVENTS } from '@tk-crawler-admin-client/shared';
import { isInElectronApp } from '@tk-crawler/electron-utils/render';
import { localStorageStore } from './local-storage-store';

export async function getToken(): Promise<string> {
  if (isInElectronApp()) {
    return window.ipcRenderer.invoke(TOKEN_EVENTS.GET_TOKEN);
  }
  return localStorageStore.getItem('token');
}

export async function setToken(token: string): Promise<void> {
  if (isInElectronApp()) {
    return window.ipcRenderer.invoke(TOKEN_EVENTS.SET_TOKEN, token);
  }
  localStorageStore.setItem('token', token);
}

export async function removeToken(): Promise<void> {
  if (isInElectronApp()) {
    return window.ipcRenderer.invoke(TOKEN_EVENTS.REMOVE_TOKEN);
  }
  localStorageStore.removeItem('token');
}
