let currentCookie = '';

export function setTiktokCookie(cookie: string) {
  currentCookie = cookie;
}

export function getTiktokCookie() {
  return currentCookie;
}

export function getMsTokenFromCookie() {
  const cookieArray = currentCookie.split(';').map(item => item.trim());
  for (const item of cookieArray) {
    const equalIndex = item.indexOf('=');
    const key = item.slice(0, equalIndex);
    if (key === 'msToken') {
      return item.slice(equalIndex + 1);
    }
  }
  return '';
}
