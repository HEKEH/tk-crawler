/** 这个方法只要scheme格式正确，其实没什么用 */
export function openScheme(scheme: string, timeout = 2000) {
  return new Promise<void>((resolve, reject) => {
    try {
      const handleBlur = () => {
        window.removeEventListener('blur', handleBlur);
        resolve();
      };

      window.addEventListener('blur', handleBlur);

      const link = document.createElement('a');
      link.href = scheme;
      // 使用绝对定位将元素移出可视区域，而不是 display:none
      link.style.position = 'absolute';
      link.style.left = '-9999px';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1);
      setTimeout(() => {
        window.removeEventListener('blur', handleBlur);
        reject(new Error('打开链接失败或超时'));
      }, timeout);
    } catch (e) {
      reject(e);
    }
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
