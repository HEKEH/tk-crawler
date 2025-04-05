import type { BaseWindow, WebContentsView } from 'electron';
import { app, session } from 'electron';

export function addCSPHandle(
  view: WebContentsView,
  onError: (error: Error) => void,
) {
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
}
export function loadThirdPartyURL(
  view: WebContentsView,
  url: string,
  onError: (error: Error) => void,
) {
  addCSPHandle(view, onError);
  return view.webContents.loadURL(url);
}

export async function findElement(
  view: WebContentsView,
  selector: string,
): Promise<{ success: boolean }> {
  const result = await view.webContents.executeJavaScript(`
      (function() {
        try {
          const element = document.querySelector('${selector}');
          if (element) {
            return { success: true };
          }
          return { success: false };
        } catch (error) {
          return { success: false };
        }
      })()
    `);
  return result;
}

export async function clickElement(
  view: WebContentsView,
  selector: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await view.webContents.executeJavaScript(`
      (function() {
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

export function setElectronLang(lang = 'en-US') {
  // 设置命令行参数
  app.commandLine.appendSwitch('lang', lang);
  app.commandLine.appendSwitch('accept-language', lang);

  // 配置session
  app.whenReady().then(() => {
    // 设置拼写检查语言
    session.defaultSession.setSpellCheckerLanguages([lang]);

    // 修改请求头
    session.defaultSession.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        const headers = {
          ...details.requestHeaders,
          'Accept-Language': `${lang},en;q=0.9`,
          'Content-Language': lang,
        };
        callback({ requestHeaders: headers });
      },
    );
  });
}

export function bindViewToWindowBounds(
  view: WebContentsView,
  window: BaseWindow,
  getViewBounds: (
    windowBounds: Electron.Rectangle,
  ) => Electron.Rectangle = bounds => {
    return {
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
    };
  },
) {
  const setBounds = () => {
    const bounds = window.getBounds();
    view.setBounds(getViewBounds(bounds));
  };
  setBounds();
  window.on('resize', setBounds);
  return () => {
    window.removeListener('resize', setBounds);
  };
}

export const InputEventFunctionStr = `
function inputEvent(input, value) {
  // 获取 React 实例
  const reactInstance = Object.keys(input).find(key =>
    key.startsWith('__reactProps$') ||
    key.startsWith('__reactEventHandlers$')
  );

  if (reactInstance) {
    // 找到 React 的 onChange 处理器
    const reactProps = input[reactInstance];

    // 设置值
    input.value = value;

    // 如果存在 onChange 处理器，直接调用它
    if (reactProps.onChange) {
      // 创建一个模拟的 React 合成事件
      const fakeEvent = {
        target: input,
        currentTarget: input,
        preventDefault: () => {},
        stopPropagation: () => {},
        bubbles: true,
        cancelable: true,
        type: 'change'
      };

      // 调用 React 的 onChange 处理器
      reactProps.onChange(fakeEvent);
    }
  }
}
`;

// export const ElementClickEventFunctionStr = `
// function elementClickEvent(element) {
//   // 获取 React 实例
//   const reactInstance = Object.keys(element).find(key =>
//     key.startsWith('__reactProps$') ||
//     key.startsWith('__reactEventHandlers$')
//   );

//   if (reactInstance) {
//     // 找到 React 的 onChange 处理器
//     const reactProps = input[reactInstance];

//     // 如果存在 onClick 处理器，直接调用它
//     if (reactProps.onClick) {
//       // 创建一个模拟的 React 合成事件
//       const fakeEvent = {
//         target: element,
//         currentTarget: element,
//         preventDefault: () => {},
//         stopPropagation: () => {},
//         bubbles: true,
//         cancelable: true,
//         type: 'click',
//       };

//       // 调用 React 的 onChange 处理器
//       reactProps.onClick(fakeEvent);
//     }
//   }
// }
// `;
