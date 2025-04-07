export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export function setIntervalImmediate(callback: () => void, interval: number) {
  const intervalId = setInterval(callback, interval);
  callback();
  return intervalId;
}

export function setTimeoutImmediate(callback: () => void, timeout: number) {
  const timeoutId = setTimeout(callback, timeout);
  callback();
  return timeoutId;
}
