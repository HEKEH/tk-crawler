/** 这个方法只要scheme格式正确，其实没什么用 */
export function openScheme(scheme: string, timeout = 5000) {
  return new Promise<void>((resolve, reject) => {
    try {
      const handleBlur = () => {
        console.log('blur事件');
        window.removeEventListener('blur', handleBlur);
        resolve();
      };

      console.log('添加blur事件');
      window.addEventListener('blur', handleBlur);
      console.log('添加blur事件完成');

      const link = document.createElement('a');
      link.href = scheme;
      // 使用绝对定位将元素移出可视区域，而不是 display:none
      link.style.position = 'absolute';
      link.style.left = '-9999px';
      console.log('添加link');
      document.body.appendChild(link);
      console.log('添加link完成');
      link.click();
      console.log('点击链接');
      setTimeout(() => {
        console.log('移除link');
        document.body.removeChild(link);
        console.log('移除link完成');
      }, 1);
      setTimeout(() => {
        console.log('超时');
        window.removeEventListener('blur', handleBlur);
        resolve();
        // reject(new Error('打开链接失败或超时'));
      }, timeout);
    } catch (e) {
      console.error(e);
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
