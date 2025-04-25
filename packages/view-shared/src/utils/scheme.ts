/** 这个方法只要scheme格式正确，其实没什么用 */
export function openScheme(scheme: string, timeout = 2000) {
  return new Promise<void>((resolve, reject) => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.removeEventListener('visibilitychange', handleVisibility);
        resolve();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.open(scheme);

    // 超时处理
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibility);
      reject(new Error('打开链接失败或超时'));
    }, timeout);
  });
}
