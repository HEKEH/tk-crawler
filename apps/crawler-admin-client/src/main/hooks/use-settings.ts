import { computed, ref } from 'vue';
import { localStorageStore } from '../utils';

export interface Settings {
  error_sound_time: [number, number] | undefined;
}

let isInit = false;

const DefaultSettings: Settings = {
  error_sound_time: [10, 24],
};

const settings = ref<Settings>();
/** 后续有可能同时要设置本地和远程的设置 */
export function useSettings() {
  if (!isInit) {
    isInit = true;
    settings.value = getSettings();
  }
  return computed({
    get() {
      return settings.value!;
    },
    set(value: Settings) {
      settings.value = value;
      localStorageStore.setItem('local-settings', value);
    },
  });
}

export function getSettings() {
  const settings = localStorageStore.getItem<Settings | undefined>(
    'local-settings',
  );
  return settings ?? DefaultSettings;
}
