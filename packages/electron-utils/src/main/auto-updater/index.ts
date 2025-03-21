import type { Logger } from '@tk-crawler/shared';
import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

export class AutoUpdater {
  private _logger: Logger;

  /** 已经在更新过程中 */
  private _isInUpdatingProcess = false;
  private _appInstallUrl: string;
  constructor(logger: Logger, appInstallUrl: string) {
    this._logger = logger;
    this._appInstallUrl = appInstallUrl;
    this.init();
  }

  init() {
    autoUpdater.autoDownload = false;
    autoUpdater.on('checking-for-update', () => {
      this._logger.info('正在检查更新...');
    });

    autoUpdater.on('update-available', info => {
      this._isInUpdatingProcess = true;
      this._logger.info('有可用更新', info);
      dialog
        .showMessageBox({
          type: 'info',
          title: '发现更新',
          message: `发现新版本: ${info.version}`,
          detail: '是否现在下载更新？',
          buttons: ['是', '否'],
        })
        .then(result => {
          if (result.response === 0) {
            autoUpdater.downloadUpdate();
          } else {
            this._isInUpdatingProcess = false;
          }
        });
    });

    autoUpdater.on('update-not-available', info => {
      this._logger.info('当前已是最新版本', info);
    });

    autoUpdater.on('error', (err: any) => {
      this._logger.error('更新出错', err);
      const isSignatureError =
        err.message.includes('Code signature') ||
        (err.code === -1 && err.domain === 'SQRLCodeSignatureErrorDomain');

      if (isSignatureError) {
        dialog
          .showMessageBox({
            type: 'error',
            title: '更新出错',
            message: `由于软件没有有效证书，无法自动更新。请打开链接手动下载安装文件: ${this._appInstallUrl}`,
            buttons: ['确定'],
          })
          .finally(() => {
            this._isInUpdatingProcess = false;
          });
      } else {
        dialog.showErrorBox('更新出错', err.message);
        this._isInUpdatingProcess = false;
      }
    });

    autoUpdater.on('download-progress', progressObj => {
      const logMessage = `下载速度: ${progressObj.bytesPerSecond} - 已下载 ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      this._logger.info(logMessage);
    });

    autoUpdater.on('update-downloaded', info => {
      this._logger.info('更新已下载', info);
      dialog
        .showMessageBox({
          type: 'info',
          title: '安装更新',
          message: '更新已下载',
          detail: '应用将退出并安装更新',
          buttons: ['现在重启', '稍后重启'],
        })
        .then(result => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall(false, true);
          }
        })
        .finally(() => {
          this._isInUpdatingProcess = false;
        });
    });
  }

  async checkForUpdates() {
    if (this._isInUpdatingProcess) {
      return;
    }
    const result = await autoUpdater.checkForUpdates();
    this._logger.info('更新检查结果', result);
  }
}
