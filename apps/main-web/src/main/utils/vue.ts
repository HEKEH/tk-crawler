import type { InjectionKey } from 'vue';
import { inject, provide, reactive } from 'vue';
import GlobalStore from '../domain/global-store';

const GlobalStoreKey: InjectionKey<GlobalStore> = Symbol('GlobalStore');

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
  const globalStore = inject(GlobalStoreKey);
  if (!globalStore) {
    throw new Error(
      'GlobalStore is not provided. Please make sure you register it.',
    );
  }
  return globalStore;
}
