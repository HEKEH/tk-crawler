import { ref } from 'vue';

/**
 * 点击多次
 * @param times 点击次数的阈值
 * @param interval 间隔时间的阈值
 * @returns 是否已点击多次
 */
export function useClickMultipleTimes(times: number, interval: number = 1000) {
  if (times <= 1 || interval <= 0) {
    throw new Error('times and interval error');
  }
  const lastClickTime = ref(0);
  const currentClickTimes = ref(0);
  return (): boolean => {
    const now = Date.now();
    if (now - lastClickTime.value < interval) {
      currentClickTimes.value++;
      if (currentClickTimes.value >= times) {
        currentClickTimes.value = 0;
        lastClickTime.value = 0;
        return true;
      }
    } else {
      currentClickTimes.value = 1;
    }
    lastClickTime.value = now;
    return false;
  };
}
