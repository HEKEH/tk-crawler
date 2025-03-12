import { localStorageStore } from './local-storage-store';

export async function getToken() {
  // TODO, 需要处理electron的场景
  return localStorageStore.getItem('token');
}

export async function setToken(token: string) {
  // TODO, 需要处理electron的场景
  localStorageStore.setItem('token', token);
}

export async function removeToken() {
  // TODO, 需要处理electron的场景
  localStorageStore.removeItem('token');
}
