import type { ElMessageBoxOptions } from 'element-plus';
import type { VNode } from 'vue';
import { getRandomShortString } from '@tk-crawler/shared';
import { ElMessageBox } from 'element-plus';
import '../styles/confirm-after-seconds.scss';

const ConfirmButtonClass = 'confirm-after-seconds-btn';

export async function confirmAfterSeconds(
  message: string | VNode,
  seconds: number = 2,
  options?: ElMessageBoxOptions,
) {
  let timer: NodeJS.Timeout | undefined;
  const className = `${ConfirmButtonClass}-${getRandomShortString(8)}`;
  try {
    const promise = ElMessageBox.confirm(message, {
      type: 'warning',
      confirmButtonText: `确定 (${seconds}s)`,
      cancelButtonText: '取消',
      confirmButtonClass: `${className} is-disabled`,
      ...options,
    });
    const updateConfirmBtn = () => {
      const confirmBtn = document.querySelector(
        `.${className}`,
      ) as HTMLButtonElement;
      if (confirmBtn) {
        if (seconds > 0) {
          confirmBtn.disabled = true;
          confirmBtn.textContent = `确定 (${seconds}s)`;
        } else {
          clearInterval(timer);
          confirmBtn.disabled = false;
          confirmBtn.textContent = '确定';
          confirmBtn.classList.remove('is-disabled');
        }
      }
    };
    timer = setInterval(() => {
      seconds--;
      updateConfirmBtn();
    }, 1000);
    await promise;
  } finally {
    timer && clearInterval(timer);
  }
}
