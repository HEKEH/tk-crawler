import type { WebContentsView } from 'electron';

export async function loadUrlWithPreconnect(
  view: WebContentsView,
  url: string,
  numSockets: number = 3,
) {
  try {
    // 等待preconnect完成
    await view.webContents.session.preconnect({
      url,
      numSockets,
    });

    // 设置加载超时
    const loadPromise = view.webContents.loadURL(url);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Load URL timeout')), 30000);
    });

    await Promise.race([loadPromise, timeoutPromise]);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load URL: ${errorMessage}`);
  }
}
