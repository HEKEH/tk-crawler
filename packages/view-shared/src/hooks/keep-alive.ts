import { onActivated, ref } from 'vue';

/** 忽略first mount */
export function onKeepAliveActivated(callback: () => void) {
  const isFirstMount = ref(true);
  onActivated(() => {
    if (isFirstMount.value) {
      isFirstMount.value = false;
      return;
    }
    callback();
  });
}
