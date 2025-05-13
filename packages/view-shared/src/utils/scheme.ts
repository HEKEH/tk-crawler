/** 这个方法只要scheme格式正确，其实没什么用 */
export function openScheme(scheme: string, timeout = 2000) {
  return new Promise<void>((resolve, reject) => {
    const handleBlur = () => {
      window.removeEventListener('blur', handleBlur);
      resolve();
    };

    window.addEventListener('blur', handleBlur);

    // 使用 anchor 元素代替 window.open
    const link = document.createElement('a');
    link.href = scheme;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 超时处理
    setTimeout(() => {
      window.removeEventListener('blur', handleBlur);
      reject(new Error('打开链接失败或超时'));
    }, timeout);
  });
  // return new Promise<void>((resolve, reject) => {
  //   const handleVisibility = () => {
  //     if (document.hidden) {
  //       document.removeEventListener('visibilitychange', handleVisibility);
  //       resolve();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibility);
  //   window.open(scheme, '_blank');

  //   // 超时处理
  //   setTimeout(() => {
  //     document.removeEventListener('visibilitychange', handleVisibility);
  //     reject(new Error('打开链接失败或超时'));
  //   }, timeout);
  // });
}
