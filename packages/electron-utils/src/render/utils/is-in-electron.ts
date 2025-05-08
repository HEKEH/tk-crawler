export function isInElectronApp(): boolean {
  return window.ipcRenderer !== undefined;
}
