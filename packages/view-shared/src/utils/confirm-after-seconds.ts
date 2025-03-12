import type { ElMessageBoxOptions } from 'element-plus';
import { ElMessageBox } from 'element-plus';
import '../styles/confirm-after-seconds.scss';

const ConfirmButtonClass = 'confirm-after-seconds-btn';

export async function confirmAfterSeconds(
  message: string,
  seconds: number,
  options?: ElMessageBoxOptions,
) {
  let timer: NodeJS.Timeout | undefined;
  try {
    const instance = ElMessageBox.confirm(message, {
      type: 'warning',
      confirmButtonText: `确定 (${seconds}s)`,
      cancelButtonText: '取消',
      confirmButtonClass: `${ConfirmButtonClass} is-disabled`,
      ...options,
    });
    const updateConfirmBtn = () => {
      const confirmBtn = document.querySelector(
        `.${ConfirmButtonClass}`,
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
    await instance;
    timer && clearInterval(timer);
  } catch (e) {
    timer && clearInterval(timer);
    throw e;
  }
}
