import type { WebContentsView } from 'electron';

export async function loadUrlWithPreconnect(
  view: WebContentsView,
  url: string,
  numSockets: number = 3,
) {
  await view.webContents.session.preconnect({
    url,
    numSockets,
  });
  await view.webContents.loadURL(url);
}
