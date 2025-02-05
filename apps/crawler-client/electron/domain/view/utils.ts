import type { BaseWindow, WebContentsView } from 'electron';

export function bindViewToWindowBounds(
  view: WebContentsView,
  window: BaseWindow,
) {
  const setBounds = () => {
    const bounds = window.getBounds();
    view.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
    });
  };
  setBounds();
  window.on('resize', setBounds);
}
