import type { WebContentsView } from 'electron';

export function catchRequestCookies(
  url: string,
  view: WebContentsView,
  onCookiesCatch: (cookies: string) => void,
) {
  view.webContents.session.webRequest.onBeforeSendHeaders(
    { urls: [url] },
    (details, callback) => {
      const cookies = details.requestHeaders.Cookie;
      onCookiesCatch(cookies);
      callback(details);
    },
  );
}
