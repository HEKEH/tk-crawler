import type { IpcRendererEvent } from 'electron';

/**
 * 因为在render进程中直接使用off是无效的，详见https://github.com/electron/electron/issues/45224
 * 所以单独封装一个类来管理
 */
class ElectronRenderListeners {
  private static _instance: ElectronRenderListeners;
  private _listeners: Map<string, ((...args: any[]) => any)[]> = new Map();

  private _createChannelListenCallback(channel: string) {
    return (event: IpcRendererEvent, ...args: any[]) => {
      const listeners = this._listeners.get(channel);
      if (!listeners?.length) {
        return;
      }
      listeners.forEach(listener => listener(event, ...args));
    };
  }

  on(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => any,
  ) {
    if (!this._listeners.has(channel)) {
      this._listeners.set(channel, []);
      window.ipcRenderer.on(
        channel,
        this._createChannelListenCallback(channel),
      );
    }
    this._listeners.get(channel)!.push(listener);
  }

  off(channel: string, listener: (...args: any[]) => any) {
    const listeners = this._listeners.get(channel);
    if (!listeners?.length) {
      throw new Error(`Listener for channel ${channel} not found`);
    }
    const findIndex = listeners.findIndex(l => l === listener);
    if (findIndex === -1) {
      throw new Error(`Listener for channel ${channel} not found`);
    }
    listeners.splice(findIndex, 1);

    if (!listeners.length) {
      window.ipcRenderer.removeAllListeners(channel);
      this._listeners.delete(channel);
    }
  }

  private constructor() {}

  static getInstance() {
    if (!ElectronRenderListeners._instance) {
      ElectronRenderListeners._instance = new ElectronRenderListeners();
    }
    return ElectronRenderListeners._instance;
  }
}

export { ElectronRenderListeners };
