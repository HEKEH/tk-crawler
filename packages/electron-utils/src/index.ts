import type { WebContentsView } from 'electron';

export function loadThirdPartyURL(
  view: WebContentsView,
  url: string,
  onError: (error: Error) => void,
) {
  view.webContents.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  );
  view.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    try {
      const {
        'Content-Security-Policy': csp1,
        'content-security-policy': csp2,
        ...others
      } = details.responseHeaders || {};

      if (csp1 || csp2) {
        callback({
          responseHeaders: {
            ...others, // 保留所有原始响应头
            'Content-Security-Policy': [
              `default-src * 'unsafe-inline' 'unsafe-eval'`,
            ],
          },
        });
      } else {
        callback({
          responseHeaders: details.responseHeaders,
        });
      }
    } catch (error) {
      // 发生错误时也要调用callback
      onError(error as Error);
      callback({ responseHeaders: details.responseHeaders });
    }
  });
  return view.webContents.loadURL(url);
}

export async function clickElement(
  view: WebContentsView,
  selector: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await view.webContents.executeJavaScript(`
      (function() {
        console.log('click element', '${selector}');
        try {
          const element = document.querySelector('${selector}');
          if (element) {
            element.click();
            return { success: true };
          }
          return { success: false, error: 'Element not found' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    `);
  return result;
}
