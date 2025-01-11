import path from 'node:path';
import process from 'node:process';
// import { createRequire } from 'node:module'
// import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, session } from 'electron';

// const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;
let win: BrowserWindow | null;

async function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      // session: session.fromPartition('persist:name', {
      //   allowRunningInsecureContent: true,
      //   cookies: {
      //     sameSite: 'no_restriction', // 允许第三方 cookie
      //   },
      // }),
    },
  });

  try {
    // 加载目标网页
    await win.loadURL('https://live-backstage.tiktok.com/portal/overview');
  } catch (error) {
    console.error('Error loading URL:', error);
  }

  // 获取所有 cookies
  async function getCookies() {
    try {
      const cookies = await session.defaultSession.cookies.get({});
      console.log('Current cookies:', cookies);
      return cookies;
    } catch (error) {
      console.error('Error getting cookies:', error);
      return [];
    }
  }

  getCookies().then(cookies => {
    console.log('Current cookies:', cookies);
  });

  // 监听 cookie 变化
  // session.defaultSession.cookies.on(
  //   'changed',
  //   (event, cookie, cause, removed) => {
  //     console.log('Cookie changed:', {
  //       cookie,
  //       cause,
  //       removed,
  //     });
  //   },
  // );

  // 你可以在适当的时机调用 getCookies()
  // 比如设置一个按钮或快捷键来触发
}

// function createWindow() {
//   win = new BrowserWindow({
//     icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.mjs'),
//     },
//   });

//   // Test active push message to Renderer-process.
//   win.webContents.on('did-finish-load', () => {
//     win?.webContents.send('main-process-message', new Date().toLocaleString());
//   });

//   if (VITE_DEV_SERVER_URL) {
//     win.loadURL(VITE_DEV_SERVER_URL);
//   } else {
//     // win.loadFile('dist/index.html')
//     win.loadFile(path.join(RENDERER_DIST, 'index.html'));
//   }
// }

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// // 声明支持安全状态恢复
// app.on('ready', () => {
//   if (
//     process.platform === 'darwin' &&
//     // @ts-expect-error - 忽略类型检查，因为这是macOS特有的API
//     app.applicationSupportsSecureRestorableState
//   ) {
//     // @ts-expect-error - 忽略类型检查，因为这是macOS特有的API
//     app.applicationSupportsSecureRestorableState = true;
//   }
// });

app.whenReady().then(async () => {
  await session.defaultSession.clearStorageData({
    storages: ['serviceworkers'],
  });
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders } = details;
    requestHeaders['User-Agent'] =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    requestHeaders['Accept-Language'] = 'en-US,en;q=0.9';
    callback({ requestHeaders });
  });
  await createWindow();
});
