import { dirname, join } from 'node:path';
import process from 'node:process';
import { app } from 'electron';

export function getExtraResourcesPath(isDevelopment: boolean) {
  if (isDevelopment) {
    return join(app.getAppPath(), 'extra-resources');
  }
  const exePath = app.getPath('exe');

  if (process.platform === 'darwin') {
    // macOS: 可执行文件在 Contents/MacOS/ 目录下
    // 需要往上走两级到 Contents 目录，然后进入 Resources
    const contentsPath = dirname(dirname(exePath));
    return join(contentsPath, 'Resources', 'extra-resources');
  }
  // Windows: 可执行文件和 resources 在同一目录
  const appPath = dirname(exePath);
  return join(appPath, 'resources', 'extra-resources');
}
