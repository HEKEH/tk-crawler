import type { InjectionKey } from 'vue';
import { inject, provide, reactive } from 'vue';
import GlobalStore from '../domain/global-store';

// 将 Symbol 存储在 window 对象上，确保热更新时不会重新创建
const GlobalStoreKey: InjectionKey<GlobalStore> =
  (window as any).__TK_GLOBAL_STORE_KEY__ ||
  ((window as any).__TK_GLOBAL_STORE_KEY__ = Symbol('GlobalStore'));

let globalStore: GlobalStore;

export function getGlobalStore() {
  if (!globalStore) {
    globalStore = reactive(new GlobalStore()) as GlobalStore;
  }
  return globalStore;
}

/** register global store when init */
export function provideGlobalStore() {
  if (!globalStore) {
    globalStore = reactive(new GlobalStore()) as GlobalStore;
  }
  provide(GlobalStoreKey, globalStore);
  return globalStore;
}

export function useGlobalStore(): GlobalStore {
  const _globalStore = inject(GlobalStoreKey);
  if (!_globalStore) {
    throw new Error(
      'GlobalStore is not provided. Please make sure you register it.',
    );
  }
  return _globalStore;
}
