import type { BaseWindow, WebContentsView } from 'electron';

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
}
