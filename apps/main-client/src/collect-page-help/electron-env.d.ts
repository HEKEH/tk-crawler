// Used in Renderer process, expose in `preload.ts`
interface Window {
  /** on 和 off 请使用 ElectronRenderListeners 中的 on 和 off 来替代 */
  ipcRenderer: Omit<import('electron').IpcRenderer, 'on' | 'off'>;
}
