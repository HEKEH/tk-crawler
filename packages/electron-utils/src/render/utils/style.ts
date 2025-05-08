import { isInElectronApp } from './is-in-electron';

export function getBodyHeight() {
  return isInElectronApp()
    ? 'calc(100% - var(--top-bar-height) - 30px)'
    : 'calc(100% - var(--top-bar-height))';
}
