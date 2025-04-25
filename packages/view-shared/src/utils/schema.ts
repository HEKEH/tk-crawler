export function openSchema(schema: string, timeout = 2000) {
  return new Promise<void>((resolve, reject) => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.removeEventListener('visibilitychange', handleVisibility);
        resolve();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.open(schema, '_blank');

    // 超时处理
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibility);
      reject(new Error('打开链接失败或超时'));
    }, timeout);
  });
}
