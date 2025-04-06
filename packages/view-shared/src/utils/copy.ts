import { ElMessage } from 'element-plus';

export async function copyToClipboard(text: string) {
  if (!text) {
    ElMessage.warning('没有内容可复制');
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      ElMessage.success('复制成功');
      return;
    } catch (error) {
      console.error('使用 Clipboard API 复制失败:', error);
    }
  }
  const successful = fallbackCopyToClipboard(text);
  if (!successful) {
    ElMessage.warning('复制失败，请手动复制');
  }
}

function fallbackCopyToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // 设置样式使元素不可见
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);

  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    return successful;
  } catch (err) {
    console.error('使用 execCommand 复制失败:', err);
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}
